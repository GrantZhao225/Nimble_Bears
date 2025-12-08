import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import multer from 'multer';


const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
const MONGO_URI = 'mongodb+srv://gz220310_db_user:cUlhh3z821WUvwEL@cluster0.hughmek.mongodb.net/task-allocator?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Google Gemini AI Setup
const genAI = new GoogleGenerativeAI('');

import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, unique);
  }
});
const upload = multer({ storage });

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  avatar: String, // Add this field for profile picture
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
  availability: [{
    date: Date,
    startTime: String,
    endTime: String,
    available: Boolean
  }],
  createdAt: { type: Date, default: Date.now }
});


const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teams: [{
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  teamId: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['In Progress', 'Upcoming', 'Completed'], default: 'Upcoming' },
  dueDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  teamId: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  content: String,
  type: { type: String, enum: ['text', 'system'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

const chatSummarySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  teamId: String,
  date: { type: Date, default: Date.now },
  summary: String,
  extractedTasks: [{
    title: String,
    description: String,
    assignedTo: String
  }],
  messageCount: Number,
  createdAt: { type: Date, default: Date.now }
});

const invitationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  projectTitle: String,
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invitedByEmail: String,
  invitedByName: String,
  inviteeEmail: { type: String, required: true },
  inviteeUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Organization = mongoose.model('Organization', organizationSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);
const Message = mongoose.model('Message', messageSchema);
const ChatSummary = mongoose.model('ChatSummary', chatSummarySchema);
const Invitation = mongoose.model('Invitation', invitationSchema);

// File schema & model
const fileSchema = new mongoose.Schema({
  name: String,
  filename: String,
  path: String,
  url: String,
  size: Number,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// DirectMessage schema & model
const directMessageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

app.use('/uploads', express.static(UPLOAD_DIR));
// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, organizationName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create organization if provided
    let organization = null;
    if (organizationName) {
      organization = new Organization({
        name: organizationName,
        createdBy: null // Will update after user creation
      });
      await organization.save();
    }

    const user = new User({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      organizationId: organization?._id,
      role: organization ? 'admin' : 'member'
    });

    await user.save();

    // Update organization with creator
    if (organization) {
      organization.createdBy = user._id;
      organization.members.push(user._id);
      await organization.save();
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar, // Add this
        organizationId: user.organizationId,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar, // Add this
        organizationId: user.organizationId,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJECT ROUTES ====================

// Get all projects user is a member of
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    // Get projects where user is creator or member
    const projects = await Project.find({
      $or: [
        { createdBy: user._id },
        { members: user._id },
        { organizationId: user.organizationId }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project by ID
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member or creator
    const isMember = project.members.some(m => m._id.toString() === user._id.toString());
    const isCreator = project.createdBy._id.toString() === user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const project = new Project({
      ...req.body,
      organizationId: user.organizationId,
      createdBy: user._id,
      members: [user._id] // Creator is automatically a member
    });
    await project.save();
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASK ROUTES ====================

// Get tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    const user = await User.findById(req.user.userId);
    
    let query = {};
    
    if (projectId) {
      // Verify user has access to this project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const isMember = project.members.some(m => m.toString() === user._id.toString());
      const isCreator = project.createdBy.toString() === user._id.toString();
      
      if (!isMember && !isCreator) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      query.projectId = projectId;
    } else {
      // If no projectId, get all projects user is member of, then get tasks for those projects
      const userProjects = await Project.find({
        $or: [
          { createdBy: user._id },
          { members: user._id }
        ]
      }).select('_id');
      
      const projectIds = userProjects.map(p => p._id);
      query.projectId = { $in: projectIds };
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      assignedBy: req.user.userId
    });
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedTo', 'name email').populate('assignedBy', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user availability
app.get('/api/users/:userId/availability', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.availability || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user availability for a specific date
app.delete('/api/users/availability', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dateObj = new Date(date);
    user.availability = user.availability.filter(a => {
      const availDate = new Date(a.date);
      return availDate.toISOString().split('T')[0] !== dateObj.toISOString().split('T')[0];
    });

    await user.save();
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile (including avatar)
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    
    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      organizationId: user.organizationId,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHAT ROUTES ====================

// Get messages for a project
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const messages = await Message.find({ projectId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { projectId, content, type } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = new Message({
      projectId,
      organizationId: user.organizationId,
      senderId: user._id,
      senderName: user.name,
      content,
      type: type || 'text'
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Summarize chat with Gemini AI
app.post('/api/chat/summarize', authenticateToken, async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages for the time period
    const query = {
      projectId,
      createdAt: {
        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date()
      }
    };

    const messages = await Message.find(query).sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.json({ summary: 'No messages to summarize', extractedTasks: [] });
    }

    // Format messages for AI
    const chatText = messages.map(m => 
      `${m.senderName}: ${m.content}`
    ).join('\n');

    // Use Gemini to summarize and extract tasks
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Analyze this team chat conversation and provide:
1. A concise summary of the main discussion points
2. Extract any tasks or action items mentioned, including who should do them

Chat conversation:
${chatText}

Please respond in JSON format:
{
  "summary": "brief summary here",
  "tasks": [
    {
      "title": "task title",
      "description": "task description",
      "assignedTo": "person name or 'unassigned'"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse AI response
    let aiData;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      aiData = JSON.parse(cleanText);
    } catch (e) {
      aiData = { summary: text, tasks: [] };
    }

    // Save summary to database
    const summary = new ChatSummary({
      projectId,
      organizationId: user.organizationId,
      summary: aiData.summary,
      extractedTasks: aiData.tasks || [],
      messageCount: messages.length
    });
    await summary.save();

    res.json({
      summary: aiData.summary,
      extractedTasks: aiData.tasks || [],
      messageCount: messages.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat summaries for a project
app.get('/api/chat/summaries', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const summaries = await ChatSummary.find({ 
      projectId 
    }).sort({ createdAt: -1 }).limit(10);
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate technical spec from chat requirements (Gemini)
app.post('/api/chat/tech-spec', authenticateToken, async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check membership
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Same message window logic as summarize
    const query = {
      projectId,
      createdAt: {
        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date()
      }
    };

    const messages = await Message.find(query).sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.json({ techSpec: 'No messages found for this period.' });
    }

    const chatText = messages
      .map(m => `${m.senderName}: ${m.content}`)
      .join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a senior software engineer.
From the following project team chat, infer the product requirements and translate them into a concrete, implementation-oriented technical specification.

Focus on:
- Context and goals
- Functional requirements
- Data model / APIs
- Integration points
- Non-functional requirements (performance, reliability, security, etc.)
- Open questions / ambiguities

Write clear markdown with headings.

Chat conversation:
${chatText}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ techSpec: text });
  } catch (error) {
    console.error('Error generating tech spec:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Export extracted AI tasks into real Task documents
app.post('/api/chat/export-tasks', authenticateToken, async (req, res) => {
  try {
    const { projectId, tasks } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'No tasks provided to export' });
    }

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();

    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Try to match assignees by name/email in the same org
    const orgUsers = await User.find({ organizationId: user.organizationId });

    const findAssigneeId = (assignedTo) => {
      if (!assignedTo || assignedTo.toLowerCase() === 'unassigned') return null;
      const normalized = assignedTo.trim().toLowerCase();

      const match = orgUsers.find(u =>
        (u.name && u.name.toLowerCase() === normalized) ||
        (u.email && u.email.toLowerCase() === normalized)
      );
      return match ? match._id : null;
    };

    const createdTasks = [];
    for (const t of tasks) {
      const assigneeId = findAssigneeId(t.assignedTo);

      const task = new Task({
        title: t.title || 'Untitled task',
        description: t.description || '',
        projectId,
        assignedTo: assigneeId || undefined,
        assignedBy: user._id,
        status: 'Pending',
        priority: 'Medium'
      });

      await task.save();
      createdTasks.push(task);
    }

    // Optionally populate before returning
    const populatedTasks = await Task.find({
      _id: { $in: createdTasks.map(t => t._id) }
    })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');

    return res.status(201).json({ tasks: populatedTasks });
  } catch (error) {
    console.error('Error exporting tasks from chat:', error);
    return res.status(500).json({ error: error.message });
  }
});


// ==================== ORGANIZATION & TEAM ROUTES ====================

// Get organization details
app.get('/api/organization', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const organization = await Organization.findById(user.organizationId)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team
app.post('/api/teams', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const organization = await Organization.findById(user.organizationId);
    
    organization.teams.push({
      name: req.body.name,
      members: req.body.members || []
    });
    
    await organization.save();
    res.status(201).json(organization.teams[organization.teams.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users in organization
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const users = await User.find({ organizationId: user.organizationId })
      .select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user availability
app.put('/api/users/availability', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { availability: req.body } },
      { new: true }
    );
    res.json(user.availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== INVITATION ROUTES ====================

// Send invitation to project
app.post('/api/projects/:projectId/invitations', authenticateToken, async (req, res) => {
  try {
    const { inviteeEmail } = req.body;
    const user = await User.findById(req.user.userId);
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is creator or member
    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'You do not have permission to invite users to this project' });
    }

    // Check if user exists
    const inviteeUser = await User.findOne({ email: inviteeEmail });
    
    // Check if already invited
    const existingInvitation = await Invitation.findOne({
      projectId: project._id,
      inviteeEmail,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'User already invited to this project' });
    }

    // Check if already a member
    if (inviteeUser && project.members.some(m => m.toString() === inviteeUser._id.toString())) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    const invitation = new Invitation({
      projectId: project._id,
      projectTitle: project.title,
      invitedBy: user._id,
      invitedByEmail: user.email,
      invitedByName: user.name,
      inviteeEmail,
      inviteeUserId: inviteeUser?._id,
      status: 'pending'
    });

    await invitation.save();
    res.status(201).json({
      invitation,
      userExists: !!inviteeUser,
      message: inviteeUser 
        ? 'Invitation sent to existing user' 
        : 'Invitation created (user will need to sign up first)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get invitations for current user
app.get('/api/invitations', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const invitations = await Invitation.find({
      inviteeEmail: user.email,
      status: 'pending'
    })
      .populate('projectId', 'title description')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation
app.post('/api/invitations/:invitationId/accept', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const invitation = await Invitation.findById(req.params.invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.inviteeEmail !== user.email) {
      return res.status(403).json({ error: 'This invitation is not for you' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    const project = await Project.findById(invitation.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Add user to project members if not already a member
    if (!project.members.some(m => m.toString() === user._id.toString())) {
      project.members.push(user._id);
      await project.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.json({ message: 'Invitation accepted', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject invitation
app.post('/api/invitations/:invitationId/reject', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const invitation = await Invitation.findById(req.params.invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.inviteeEmail !== user.email) {
      return res.status(403).json({ error: 'This invitation is not for you' });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.json({ message: 'Invitation rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== FILE ROUTES ====================

// Upload a file for a project
app.post('/api/files', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();
    if (!isMember && !isCreator) return res.status(403).json({ error: 'Access denied' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file;
    const fileDoc = new File({
      name: file.originalname,
      filename: file.filename,
      path: file.path,
      url: `http://localhost:5000/uploads/${file.filename}`, // Full URL for file access
      size: file.size,
      projectId,
      uploadedBy: user._id
    });

    await fileDoc.save();
    res.status(201).json(fileDoc);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List files for a project
app.get('/api/files', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();
    if (!isMember && !isCreator) return res.status(403).json({ error: 'Access denied' });

    const files = await File.find({ projectId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a file (remove DB record and file from disk)
app.delete('/api/files/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;
    const user = await User.findById(req.user.userId);
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) return res.status(404).json({ error: 'File not found' });

    const project = await Project.findById(fileDoc.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();

    // Allow deletion if user is project member/creator or the uploader
    const isUploader = fileDoc.uploadedBy && fileDoc.uploadedBy.toString() === user._id.toString();
    if (!isMember && !isCreator && !isUploader) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove file from disk if exists
    try {
      if (fileDoc.path && fs.existsSync(fileDoc.path)) {
        fs.unlinkSync(fileDoc.path);
      }
    } catch (fsErr) {
      console.warn('Failed to remove file from disk:', fsErr);
      // continue to remove DB record even if disk cleanup fails
    }

    await File.findByIdAndDelete(fileId);
    res.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send DM (project-scoped)
app.post('/api/dms', authenticateToken, async (req, res) => {
  try {
    const { projectId, recipientId, content, fileId } = req.body;
    if (!projectId || !recipientId) return res.status(400).json({ error: 'projectId and recipientId required' });

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    const recipientIsMember = project.members.some(m => m.toString() === recipientId.toString());
    const isCreator = project.createdBy.toString() === user._id.toString();

    if (!isMember || !recipientIsMember) return res.status(403).json({ error: 'Both users must be project members' });

    const dm = new DirectMessage({ projectId, senderId: user._id, recipientId, content, fileId });
    await dm.save();

    const populated = await DirectMessage.findById(dm._id).populate('senderId', 'name email').populate('recipientId', 'name email').populate('fileId');

    // Optionally: emit socket event if socket integration exists
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error sending DM:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get DMs between current user and a participant (project-scoped)
app.get('/api/dms', authenticateToken, async (req, res) => {
  try {
    const { projectId, participantId } = req.query;
    if (!projectId || !participantId) return res.status(400).json({ error: 'projectId and participantId required' });

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    const msgs = await DirectMessage.find({
      projectId,
      $or: [
        { senderId: user._id, recipientId: participantId },
        { senderId: participantId, recipientId: user._id }
      ]
    }).sort({ createdAt: 1 }).populate('senderId', 'name').populate('recipientId', 'name').populate('fileId');

    res.json(msgs);
  } catch (error) {
    console.error('Error fetching DMs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversations summary for current user in a project (last message per participant)
app.get('/api/dms/conversations', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId required' });

    const user = await User.findById(req.user.userId);
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isMember = project.members.some(m => m.toString() === user._id.toString());
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    // Get recent DMs involving the user in this project
    const recent = await DirectMessage.find({ projectId, $or: [{ senderId: user._id }, { recipientId: user._id }] })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name')
      .populate('recipientId', 'name')
      .limit(200); // limit to reasonable number

    const map = new Map();
    for (const m of recent) {
      const otherId = m.senderId._id.toString() === user._id.toString() ? m.recipientId._id.toString() : m.senderId._id.toString();
      if (!map.has(otherId)) {
        const otherUser = m.senderId._id.toString() === user._id.toString() ? m.recipientId : m.senderId;
        map.set(otherId, {
          participant: { id: otherUser._id, name: otherUser.name },
          lastMessage: m.content,
          lastAt: m.createdAt
        });
      }
    }

    // Also include project members with no messages yet (optional)
    for (const memberId of project.members.map(m => m.toString())) {
      if (memberId === user._id.toString()) continue;
      if (!map.has(memberId)) {
        const member = await User.findById(memberId).select('name email');
        map.set(memberId, { participant: { id: member._id, name: member.name }, lastMessage: null, lastAt: null });
      }
    }

    const conversations = Array.from(map.values()).sort((a, b) => {
      if (!a.lastAt) return 1;
      if (!b.lastAt) return -1;
      return b.lastAt - a.lastAt;
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching DM conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});