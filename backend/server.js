require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

// Config must be loaded after dotenv
const { PORT, ALLOWED_ORIGINS, validateConfig } = require('./src/config');

try {
  validateConfig(console);
} catch (err) {
  console.error(`❌ ${err.message}`);
  console.error('Please copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const uploadRoutes = require('./src/routes/upload');
const statusRoutes = require('./src/routes/status');
const ttsRoutes = require('./src/routes/tts');
const { attachRealtimeStt } = require('./src/routes/realtimeStt');

const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS, optionsSuccessStatus: 200 }));
app.use(express.json());

// Routes
app.use('/api', uploadRoutes);
app.use('/api', statusRoutes);
app.use('/api', ttsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Speech Hub API' });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Create HTTP server and attach WebSocket for realtime STT
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
attachRealtimeStt(httpServer, wss);

httpServer.listen(PORT, () => {
  console.log(`✅ Speech Hub API running on http://localhost:${PORT}`);
  console.log(`🎙  Realtime STT WebSocket on ws://localhost:${PORT}/api/stt/realtime`);
});
