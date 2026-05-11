require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const User = require('./models/User');
const Conversation = require('./models/Conversation');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const videoRoutes = require('./routes/videos');
const messageRoutesFactory = require('./routes/messages');
const connectionRoutes = require('./routes/connections');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  const authHeader = socket.handshake.headers?.authorization;
  const token = socket.handshake.auth?.token || (authHeader?.startsWith('Bearer ') && authHeader.split(' ')[1]);

  if (!token) return next(new Error('Not authorized'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Not authorized'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Not authorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user_${socket.user.id}`);

  socket.on('joinConversation', async (conversationId, callback) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw new Error('Conversation not found');
      if (!conversation.participants.map(String).includes(socket.user.id.toString())) throw new Error('Unauthorized');
      socket.join(`conversation_${conversationId}`);
      callback?.({ success: true });
    } catch (err) {
      callback?.({ success: false, message: err.message });
    }
  });

  socket.on('leaveConversation', (conversationId) => {
    if (conversationId) {
      socket.leave(`conversation_${conversationId}`);
    }
  });
});

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/messages', messageRoutesFactory(io));
app.use('/api/connections', connectionRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cohort-connect';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
