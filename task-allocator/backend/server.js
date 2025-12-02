import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://gz220310_db_user:<password>@cluster0.hughmek.mongodb.net/task-allocator?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Google Gemini AI Setup
const genAI = new GoogleGenerativeAI('Here is for gemini key');

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});