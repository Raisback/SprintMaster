/**
 * SprintMaster | Agile & Scrum Project Management Suite
 * Full Backend with Auth, Models, and Task Routes
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
  status: { type: String, enum: ['Planned', 'Active', 'Completed'], default: 'Planned' }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, default: 'Backlog' },
  storyPoints: { type: Number, default: 0 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Sprint = mongoose.model('Sprint', sprintSchema);
const Task = mongoose.model('Task', taskSchema);

// --- 2. AUTH ROUTES ---

// @route   POST /api/auth/register
// @desc    Register a new user
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

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // 3. Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sprint_secret_key', // Fallback for dev
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('SprintMaster API is running...');
});

// --- 3. DATABASE CONNECTION & SERVER START ---

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sprintmaster';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));