# Speech Hub 🎙

> ศูนย์รวมด้านเสียง — STT · TTS · VTT Generation · Thai Language · Azure Powered

## Features

| Tab | คุณสมบัติ |
|-----|-----------|
| 📁 อัปโหลด | อัปโหลดไฟล์เสียง/วิดีโอ → ถอดความด้วย Azure STT → ดาวน์โหลด `.vtt` |
| 🔊 TTS | พิมพ์ข้อความไทย → Azure Neural Voice → เล่นเสียงทันที |

---

## Prerequisites

- **Node.js** ≥ 20.19+ (LTS) or 22.12+
- **FFmpeg** — `brew install ffmpeg`
- **Azure Cognitive Services** account (Speech resource)

---

## Setup

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env   # แก้ AZURE_SPEECH_KEY และ AZURE_SPEECH_REGION
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Azure

แก้ไขไฟล์ `backend/.env`:

```env
AZURE_SPEECH_KEY=<your-azure-speech-key>
AZURE_SPEECH_REGION=southeastasia   # หรือ region ที่คุณสร้าง resource
PORT=3001
MAX_FILE_SIZE_MB=500
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## Project Structure

```
speech_hub/
├── backend/
│   ├── src/
│   │   ├── routes/         upload.js · status.js · tts.js
│   │   ├── services/       converter.js · speechService.js
│   │   ├── jobs/           jobStore.js (in-memory)
│   │   └── workers/        transcribeWorker.js
│   ├── uploads/            temp files (auto-cleaned)
│   └── server.js
└── frontend/
    └── src/
        ├── components/     Dropzone · ProgressBar · StatusPoller
        └── pages/          UploadPage · RealtimePage · TTSPage
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/upload` | Upload file → `{ jobId }` |
| `GET`  | `/api/status/:jobId` | Poll job status → VTT |
| `POST` | `/api/tts` | Text → MP3 audio blob |
| `GET`  | `/api/health` | Health check |

## Tech Stack

### Backend
- **Node.js** v25.6.1 (LTS)
- **Express** v5.2.1
- **Azure Cognitive Services Speech SDK** v1.38.0
- **Google Cloud Speech** v7.2.1
- **Google Cloud Storage** v7.19.0

### Frontend
- **React** v19.2.0
- **Vite** v7.3.1
- **TailwindCSS** v4.2.0
- **Framer Motion** v12.34.2
- **React Router** v7.13.0

## Notes

- **STT** รองรับไฟล์ยาวสูงสุด 15+ นาที ผ่าน Continuous Recognition
- **ภาษา default**: `th-TH` (Thai)
- **TTS Voices**: Premwadee · Niwat · Achara (Neural)
- **Job Store**: In-memory สำหรับ dev. Production แนะนำ Redis
