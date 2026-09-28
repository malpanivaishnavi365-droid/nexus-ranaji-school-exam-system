const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./config/db');
const seedInitialData = require('./utils/seedData');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');  
const subjectRoutes = require('./routes/subjectRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const studyMaterialRoutes = require('./routes/studyMaterialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Core Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/student/dashboard', (req, res, next) => {
  // Alias to student dashboard controller
  const { getStudentDashboard } = require('./controllers/studentController');
  const authenticateToken = require('./middleware/authMiddleware');
  authenticateToken(req, res, () => getStudentDashboard(req, res, next));
});
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/quizzes', examRoutes); // Alias
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);

// Student Portal Feature Routes
app.use('/api/student/badges', badgeRoutes);
app.use('/api/student/certificates', certificateRoutes);
app.use('/api/student/study-material', studyMaterialRoutes);
app.use('/api/student/study-materials', studyMaterialRoutes); // Alias
app.use('/api/student/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Nexus Ranaji English School Examination System API',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Nexus Ranaji English School Examination System API is running!',
        endpoints: {
            health: '/api/health',
            studentLogin: 'POST /api/auth/student/login',
            facultyLogin: 'POST /api/auth/faculty/login',
            login: 'POST /api/auth/login',
            dashboard: 'GET /api/student/dashboard',
            badges: 'GET /api/student/badges',
            certificates: 'GET /api/student/certificates'
        }
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server after DB initialization
const startServer = async () => {
  try {
    await initDB();
    await seedInitialData();
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Nexus Ranaji School Exam API Server is listening on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
