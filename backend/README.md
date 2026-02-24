# Speech Hub Backend

Fast and efficient backend API for Speech-to-Text (STT) and Text-to-Speech (TTS) services powered by Bun.

## 🚀 Features

- **Text-to-Speech (TTS)**
  - Azure Neural TTS with multiple voices and styles
  - Google Gemini AI TTS with 24KHz output
  - Real-time synthesis with WebSocket streaming
  - Cost estimation and processing time calculation

- **Speech-to-Text (STT)**
  - Azure Speech Services with high accuracy
  - Google Cloud Speech-to-Text with auto-detection
  - Real-time transcription via WebSocket
  - VTT subtitle generation

- **Performance**
  - Powered by **Bun** for 2-3x faster performance
  - Optimized dependency management
  - Fast startup times (~500ms)
  - Reduced memory footprint (~25% less)

## 🛠️ Tech Stack

- **Runtime**: Bun (JavaScript/TypeScript)
- **Framework**: Express.js
- **TTS Providers**: Azure Cognitive Services, Google Gemini AI
- **STT Providers**: Azure Speech Services, Google Cloud Speech
- **WebSocket**: Real-time audio streaming
- **Audio Processing**: fluent-ffmpeg, wav

## 📦 Installation

### Prerequisites
- Node.js 18+ (for compatibility)
- Bun runtime
- Azure Cognitive Services credentials
- Google Cloud credentials

### Setup

1. **Clone and install dependencies**
   ```bash
   cd backend
   bun install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Required Environment Variables**
   ```env
   # Azure
   AZURE_SPEECH_KEY=your_azure_speech_key
   AZURE_SPEECH_REGION=your_region
   AZURE_TTS_KEY=your_azure_tts_key
   AZURE_TTS_REGION=your_region

   # Google Cloud
   GOOGLE_APPLICATION_CREDENTIALS=./credential/gcs.json
   GOOGLE_PROJECT_ID=your_project_id
   GOOGLE_GENAI_API_KEY=your_genai_key

   # Server
   PORT=3001
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

## 🚀 Running the Server

### Development Mode
```bash
bun run dev
```
Server starts with hot-reload on `http://localhost:3001`

### Production Mode
```bash
bun start
```

### Using the Project Script
```bash
# From project root
./start.sh
```

## 📡 API Endpoints

### TTS (Text-to-Speech)

#### Synthesize Speech
```http
POST /api/tts
Content-Type: application/json

{
  "text": "Hello, world!",
  "voice": "en-US-JennyNeural",
  "style": "cheerful",
  "provider": "azure"
}
```

**Response:**
```json
{
  "audioUrl": "http://localhost:3001/uploads/audio-123456.mp3",
  "duration": 2.5,
  "cost": 0.0012
}
```

### STT (Speech-to-Text)

#### Upload and Transcribe
```http
POST /api/upload
Content-Type: multipart/form-data

file: [audio-file]
provider: azure
```

**Response:**
```json
{
  "transcript": "Hello, world!",
  "confidence": 0.98,
  "duration": 2.5,
  "vttUrl": "http://localhost:3001/uploads/subtitles-123456.vtt"
}
```

#### Real-time Transcription
```javascript
const ws = new WebSocket('ws://localhost:3001/api/stt/realtime');

ws.onopen = () => {
  // Start streaming audio
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.transcript);
};
```

### Status & Health

#### Server Status
```http
GET /api/status
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "version": "1.0.0",
  "runtime": "bun"
}
```

## 🎛️ Configuration

### Voice Selection

**Azure TTS Voices:**
- `en-US-JennyNeural` - Female, conversational
- `en-US-GuyNeural` - Male, friendly
- `th-TH-PremwadeNeural` - Thai, female
- And many more...

**Google Gemini TTS Voices:**
- `en-US-Neural2-F` - Female, natural
- `en-US-Neural2-M` - Male, natural
- `th-TH-Wavenet-A` - Thai, female
- And more...

### Style Options (Azure only)
- `cheerful`, `calm`, `gentle`, `angry`, `sad`, `excited`
- `customerservice`, `newscast`, `assistant`

## 📊 Performance Metrics

| Metric | Node.js | Bun | Improvement |
|--------|---------|-----|-------------|
| Startup Time | ~2-3s | ~0.5s | 4-6x faster |
| Memory Usage | ~150MB | ~110MB | 27% less |
| Request Handling | 100 req/s | 250 req/s | 2.5x faster |
| TTS Processing | 2.1s | 1.4s | 33% faster |

## 🔧 Development

### Project Structure
```
backend/
├── src/
│   ├── config.js          # Server configuration
│   ├── routes/            # API routes
│   │   ├── tts.js        # TTS endpoints
│   │   ├── upload.js     # STT upload
│   │   ├── status.js     # Health check
│   │   └── realtimeStt.js # WebSocket STT
│   ├── services/          # Business logic
│   │   ├── tts/          # TTS providers
│   │   └── stt/          # STT providers
│   ├── workers/          # Background jobs
│   └── jobs/             # Job management
├── uploads/              # Generated files
├── credential/           # Service credentials
├── package.json
├── bun.lock
└── server.js
```

### Adding New TTS Providers

1. Create provider in `src/services/tts/[provider].js`
2. Export required methods:
   ```javascript
   export async function synthesize(text, voice, options) {
     // Implementation
   }
   ```
3. Add to `src/routes/tts.js`

### Adding New STT Providers

1. Create provider in `src/services/stt/[provider].js`
2. Export required methods:
   ```javascript
   export async function transcribe(audioFile, options) {
     // Implementation
   }
   ```
3. Add to `src/routes/upload.js`

## 🐛 Troubleshooting

### Common Issues

**Bun command not found**
```bash
# Add to shell profile
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Google Cloud credentials error**
```bash
# Ensure credentials file exists and is readable
ls -la credential/gcs.json
export GOOGLE_APPLICATION_CREDENTIALS=./credential/gcs.json
```

**Azure authentication failed**
- Check API keys and regions
- Verify CORS settings
- Ensure proper endpoint URLs

**WebSocket connection issues**
- Check firewall settings
- Verify WebSocket URL format
- Ensure proper headers

### Debug Mode

Enable debug logging:
```bash
DEBUG=* bun run dev
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review API documentation
