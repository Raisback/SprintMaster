/**
 * SprintMaster | Agile & Scrum Project Management Suite
 * Full Backend with Auth, Models, Task, and Sprint Routes
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
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['Planned', 'Active', 'Completed'], default: 'Planned' }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'], 
    default: 'Backlog' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Blocker'], 
    default: 'Medium' 
  },
  storyPoints: { type: Number, default: 0 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Sprint = mongoose.model('Sprint', sprintSchema);
const Task = mongoose.model('Task', taskSchema);

// --- 2. AUTH MIDDLEWARE ---

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sprint_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// --- 3. ROUTES ---

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'sprint_secret_key', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TASK ROUTES
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, storyPoints, priority } = req.body;
    const newTask = new Task({ title, description, storyPoints, priority, assignee: req.user.id });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee', 'username').populate('sprintId', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Move Task to Sprint (Update Task)
app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPRINT ROUTES
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

app.get('/api/sprints', authMiddleware, async (req, res) => {
  try {
    const sprints = await Sprint.find();
    res.json(sprints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('SprintMaster API is running...');
});

// --- 4. DATABASE CONNECTION ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sprintmaster';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));