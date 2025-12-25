const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); 

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
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  subtasks: [{
    text: String,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Sprint = mongoose.model('Sprint', sprintSchema);
const Task = mongoose.model('Task', taskSchema);

const authMiddleware = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    
    const fullUser = await User.findById(req.user.id).select('role');
    if (fullUser) {
      req.user.role = fullUser.role;
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    user = new User({ 
      username, 
      email, 
      password: bcrypt.hashSync(password, 10),
      role: role || 'Developer' 
    });
    await user.save();
    res.json({ msg: 'Registered successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) 
      return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET || 'secret', { expiresIn: '10h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    // Basic validation
    if (!username || !email) {
      return res.status(400).json({ msg: 'All fields are required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { username, email } },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee', 'username').populate('sprintId', 'name');
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const taskData = { ...req.body };
    if (taskData.sprintId && taskData.status === 'Backlog') {
        taskData.status = 'To Do';
    }
    const newTask = new Task(taskData);
    const task = await newTask.save();
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: { status: status } }, 
      { new: true }
    ).populate('assignee', 'username').populate('sprintId', 'name');
    
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    if (updateData.sprintId && (!updateData.status || updateData.status === 'Backlog')) {
      updateData.status = 'To Do';
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    ).populate('assignee', 'username').populate('sprintId', 'name');
    
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.delete('/api/tasks/:id', authMiddleware, checkRole(['ScrumMaster', 'ProductOwner']), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json({ msg: 'Task removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sprints', authMiddleware, checkRole(['ScrumMaster', 'ProductOwner']), async (req, res) => {
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

app.delete('/api/sprints/:id', authMiddleware, checkRole(['ScrumMaster']), async (req, res) => {
  try {
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

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sprintmaster';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected with subtask and PATCH support');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));