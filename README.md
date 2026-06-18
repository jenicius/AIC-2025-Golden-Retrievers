# AIC-2025 Golden Retrievers

Video retrieval system for the [AIC 2025](https://eventretrieval.oj.io.vn/) challenge. The project combines a FastAPI backend for multimodal search over pre-computed indexes with a React frontend for querying, reviewing results, and submitting answers to the competition platform.

## Features

- **Embedding search** — CLIP-based retrieval with multiple models (`ViT-L-14`, `ViT-L-14-quickgelu`, `ViT-H-14-quickgelu`, `PE-Core-L-14-336`) using L1, L2, or cosine distance
- **Text, image, and text-list queries** — Search by natural language, uploaded image, or a list of text queries per video
- **OCR search** — Inverted-index lookup over on-screen text (Vietnamese accent-insensitive)
- **Speech search** — Full-text search over transcribed audio via Whoosh
- **Multimodal search** — Combine text, OCR text, speech text, and image in a single query
- **Frame navigation** — Look up frames by index or convert timestamps (`HH:MM:SS`) to frame indices
- **Video gallery** — Preview results with YouTube embeds and frame thumbnails
- **Death Note** — Blacklist unwanted results and re-filter the gallery
- **CSV / submission tools** — Build and submit KIS, QA, and TRAKE answers to the competition API

## Architecture

```
┌─────────────────────┐       HTTP (localhost:8000)       ┌──────────────────────────┐
│  React Frontend     │ ────────────────────────────────► │  FastAPI Backend         │
│  (Vite + TypeScript)│                                   │  (GoldenRetriever)       │
└─────────┬───────────┘                                   └────────────┬─────────────┘
          │                                                              │
          │ HTTPS (eventretrieval.oj.io.vn)                              │ reads
          ▼                                                              ▼
┌─────────────────────┐                                   ┌──────────────────────────┐
│  Competition API    │                                   │  Local Data (indexes,    │
│  (login / submit)   │                                   │  embeddings, media info) │
└─────────────────────┘                                   └──────────────────────────┘
```

## Project structure

```
AIC-2025-Golden-Retrievers/
├── Backend/
│   ├── app/
│   │   ├── api/endpoints/query.py   # REST endpoints
│   │   ├── core/config.py           # DATA_PATH and environment settings
│   │   ├── schemas/                 # Pydantic request/response models
│   │   └── services/
│   │       ├── retrieval.py         # Search logic (CLIP, OCR, speech, multimodal)
│   │       └── readQuery.py         # Load competition query files
│   ├── test/test.py                 # API smoke tests
│   ├── Dockerfile
│   └── requirements.txt
└── Frontend/
    ├── config/
    │   ├── models.json              # Method / model / metric UI config
    │   ├── account.json             # Competition API credentials (not committed)
    │   └── query/                   # KIS, QA, TRAKE submission templates
    ├── public/Batch1_small/         # Frame preview images (download separately)
    └── src/
        ├── components/              # UI (gallery, CSV builder, death note, etc.)
        └── utils/fetchData.tsx      # Backend API client
```

## Prerequisites

| Component | Requirement |
|-----------|-------------|
| Backend | Python 3.10, Conda (recommended), CUDA GPU (optional but recommended) |
| Frontend | Node.js 18+ |
| Data | Competition dataset and indexes (see below) |

## Data setup

1. Download the **Data** folder from [Google Drive](https://drive.google.com/drive/folders/1dUPtycEUNw-i5STDmhRyPoStUPI-lUUM?usp=sharing).
2. Extract it locally.
3. Set `DATA_PATH` in `Backend/app/core/config.py` (or via a `.env` file) to point to the extracted folder, e.g. `D:/AIC2025/Data`.
4. For the frontend, copy `Data/Batch1_small` into `Frontend/public/Batch1_small` (keep the folder name unchanged).

The data directory should contain at minimum:

- `Embeddings/` — FAISS indexes per model
- `OCR/` — `full_index.json`, `word_index.json`
- `Speech/` — Whoosh index
- `file_name_mapping.json` — Frame ID to video mapping
- `media-info-aic25/` — Per-video metadata (fps, YouTube URL)

## Quick start

### Backend

```bash
conda create -n golden-backend python=3.10 -y
conda activate golden-backend
pip install -r Backend/requirements.txt

# Edit Backend/app/core/config.py → DATA_PATH

cd Backend
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Root health check: `GET /`.

### Frontend

```bash
cd Frontend
npm install
npm run dev        # development → http://localhost:5173
# or
npm run build && npm run preview   # production preview → http://localhost:4173
```

The frontend sends search requests to `http://127.0.0.1:8000`. Make sure the backend is running before querying.

### Competition credentials

Create `Frontend/config/account.json` with your team username and password to use the session/evaluation fetch and submission features:

```json
{
  "username": "your-team-id",
  "password": "your-password"
}
```

## API endpoints

All routes are prefixed with `/api/query`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/text` | Text embedding search |
| `POST` | `/image` | Image embedding search (multipart) |
| `POST` | `/ocr` | OCR text search |
| `POST` | `/speech` | Speech transcript search |
| `POST` | `/multi-modal` | Combined multimodal search (multipart) |
| `POST` | `/text-list-video` | Text-list search across videos |
| `POST` | `/frame-idx` | Retrieve frames around a given index |
| `POST` | `/time-to-frame-idx` | Convert timestamp to frame index |
| `POST` | `/read_queries` | Load competition query files from disk |

## Testing

With the backend running:

```bash
python Backend/test/test.py
```

## Docker (backend only)

```bash
cd Backend
docker build -t golden-retrievers-api .
docker run -p 8080:8080 -v /path/to/Data:/data golden-retrievers-api
```

Mount your data volume and override `DATA_PATH` via environment variable as needed.

## Further reading

- [Backend setup](Backend/README.md) — detailed Python environment and configuration
- [Frontend setup](Frontend/README.md) — build steps and preview image setup
