// server.js
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

// ========================================
// ENVIRONMENT SETUP
// ========================================
// Load .env dari parent directory (development)
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '../.env');
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.warn('⚠️  No .env file found, using environment variables');
  } else {
    console.log('✅ .env loaded from:', envPath);
  }
}

// Set timezone
process.env.TZ = process.env.TIMEZONE || 'Asia/Makassar';

console.log('================================');
console.log('🚀 Server Configuration');
console.log('================================');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Timezone:', process.env.TIMEZONE);
console.log('Plant ID:', process.env.PLANT_SSB);
console.log('Port:', process.env.PORT || 3001);
console.log('================================');

// ========================================
// DATABASE SETUP
// ========================================
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  options: `-c timezone=${process.env.TIMEZONE || 'Asia/Makassar'}`
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Export pool untuk dipakai di controllers
global.pool = pool;

// ========================================
// EXPRESS SETUP
// ========================================
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// Static files (hanya untuk development, bukan untuk Docker)
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../UI'), {
    extensions: ['html']
  }));
  console.log('📁 Serving static files from:', path.join(__dirname, '../UI'));
}

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timezone: process.env.TIMEZONE,
    timestamp: new Date().toLocaleString('id-ID', { timeZone: process.env.TIMEZONE }),
    port: process.env.PORT || 3001,
    plant: process.env.PLANT_SSB
  });
});

// ========================================
// ROUTES
// ========================================
// Network share (hanya jika accessible)
if (process.env.DRAWINGS_PATH) {
  app.use('/drawings', express.static(process.env.DRAWINGS_PATH));
  console.log('📐 Drawings path:', process.env.DRAWINGS_PATH);
}

// API Routes
app.use('/sow', require('./routes/sow'));
app.use('/usernfc', require('./routes/usernfc'));
app.use('/workcenter', require('./routes/workcenter'));
app.use('/timesheet', require('./routes/timesheet_transaction'));
app.use('/process-category', require('./routes/processCategoryRoutes'));
app.use('/process-parameter', require('./routes/processParameterRoutes'));
app.use('/process-parameter-choicebase', require('./routes/processParameterChoicebaseRoutes'));
app.use('/process-control', require('./routes/processControlDataRoutes'));
app.use('/process-control-item', require('./routes/processControlDataItemRoutes'));

// ========================================
// ERROR HANDLERS
// ========================================
// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Local time: ${new Date().toLocaleString('id-ID', { timeZone: process.env.TIMEZONE })}`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
  console.log('================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});