const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Added for file uploads
const path = require('path'); // Added for path handling
const fs = require('fs'); // Added to ensure directory existence
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// NEW: Serve the uploads folder statically so the frontend can access images
app.use('/uploads', express.static('uploads'));

// Ensure the upload directory exists before the server starts
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// NEW: Multer configuration for storing profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// --- SCHEMAS ---

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' }, // NEW: Added field
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
  storyPoints: { type: Number, default: 0 },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null },
  subtasks: [{
    text: String,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Sprint = mongoose.model('Sprint', sprintSchema);
const Task = mongoose.model('Task', taskSchema);

// --- MIDDLEWARE ---

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ msg: 'Access denied: insufficient permissions' });
  }
  next();
};

// --- ROUTES ---

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, username, email, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, profileImage: user.profileImage } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Routes
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATED: User PUT route to handle multipart/form-data for profile photos
app.put('/api/users/:id', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateData = { username, email };

    // If a file was uploaded, update the path
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task Routes
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignee', 'username').populate('sprintId', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const task = await newTask.save();
    const populatedTask = await Task.findById(task._id).populate('assignee', 'username').populate('sprintId', 'name');
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignee', 'username')
      .populate('sprintId', 'name');
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
      .populate('assignee', 'username')
      .populate('sprintId', 'name');
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', authMiddleware, checkRole(['ScrumMaster', 'ProductOwner']), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sprint Routes
app.patch('/api/sprints/:id', authMiddleware, checkRole(['ScrumMaster', 'ProductOwner']), async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(sprint);
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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sprintmaster')
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.log(err));