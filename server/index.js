/**
 * SprintMaster | Agile & Scrum Project Management Suite
 * FULL VERSION: Consolidated Auth, Tasks (with Delete), and Sprints
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// --- 1. MONGOOSE MODELS ---

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ScrumMaster', 'Developer', 'ProductOwner'], 
    default: 'Developer' 
  },
  createdAt: { type: Date, default: Date.now }
});

const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: String,
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  status: { type: String, enum: ['Planned', 'Active', 'Completed'], default: 'Active' }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'], 
    default: 'Backlog' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  storyPoints: { type: Number, default: 1 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Sprint = mongoose.model('Sprint', sprintSchema);
const Task = mongoose.model('Task', taskSchema);

// --- 2. AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// --- 3. ROUTES ---

// AUTH: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    user = new User({ username, email, password: bcrypt.hashSync(password, 10) });
    await user.save();
    res.json({ msg: 'Registered successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AUTH: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) 
      return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'secret', { expiresIn: '10h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// USERS: Get All
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// TASKS: Get All
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee', 'username').populate('sprintId', 'name');
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// TASKS: Create
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const taskData = { ...req.body };
    // If assigned to a sprint, ensure it's at least in "To Do"
    if (taskData.sprintId && taskData.status === 'Backlog') {
        taskData.status = 'To Do';
    }
    const newTask = new Task(taskData);
    const task = await newTask.save();
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// TASKS: Update
app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    // Auto-move to 'To Do' if assigned to a sprint while in Backlog
    if (updateData.sprintId && (!updateData.status || updateData.status === 'Backlog')) {
      updateData.status = 'To Do';
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    ).populate('assignee', 'username').populate('sprintId', 'name');
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TASKS: Delete
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json({ msg: 'Task removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPRINTS: Create
app.post('/api/sprints', authMiddleware, async (req, res) => {
  try {
    const { name, goal, startDate, endDate } = req.body;
    const newSprint = new Sprint({ name, goal, startDate, endDate });
    const sprint = await newSprint.save();
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPRINTS: Get All
app.get('/api/sprints', authMiddleware, async (req, res) => {
  try {
    const sprints = await Sprint.find();
    res.json(sprints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPRINTS: Delete (Cleanup tasks associated)
app.delete('/api/sprints/:id', authMiddleware, async (req, res) => {
  try {
    // Return all tasks in this sprint back to Backlog
    await Task.updateMany(
      { sprintId: req.params.id },
      { $set: { sprintId: null, status: 'Backlog' } }
    );
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ msg: 'Sprint not found' });
    res.json({ msg: 'Sprint deleted and tasks returned to backlog' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. DATABASE CONNECTION ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sprintmaster';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));