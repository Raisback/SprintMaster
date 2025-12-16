/**
 * SprintMaster | Agile & Scrum Project Management Suite
 * Backend Entry Point & Schema Definitions
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- MONGOOSE MODELS ---

// 1. User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed via bcrypt
  role: { 
    type: String, 
    enum: ['ScrumMaster', 'Developer', 'ProductOwner'], 
    default: 'Developer' 
  },
  createdAt: { type: Date, default: Date.now }
});

// 2. Sprint Schema
const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: String,
  startDate: Date,
  endDate: Date,
  status: { 
    type: String, 
    enum: ['Planned', 'Active', 'Completed'], 
    default: 'Planned' 
  },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' }
}, { timestamps: true });

// 3. Task (User Story) Schema
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
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null }, // Null = in Backlog
  history: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Sprint = mongoose.model('Sprint', sprintSchema);
const Task = mongoose.model('Task', taskSchema);

// --- BASIC ROUTES ---

app.get('/', (req, res) => {
  res.send('SprintMaster API is running...');
});

// Example: Get all tasks in the Backlog
app.get('/api/tasks/backlog', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'Backlog' }).populate('assignee', 'username');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sprintmaster';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
