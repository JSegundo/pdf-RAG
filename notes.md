pdf-parse for server
https://www.npmjs.com/package/pdf-parse

pdf-lib client
https://www.npmjs.com/package/pdf-lib

├── api-server/                  # Node.js API Server
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   │   ├── chat.ts        # Chat endpoints
│   │   │   └── documents.ts    # Document upload endpoints
│   │   ├── services/
│   │   │   ├── chat/          # Chat-related services
│   │   │   │   ├── manager.ts # Orchestrates chat flow
│   │   │   │   └── history.ts # Manages chat history
│   │   │   └── documents/     # Document-related services
│   │   ├── websocket/         # WebSocket handlers
│   │   └── queue/             # Queue producers
│   └── config/
│
├── processing-service/          # Python Processing Service
│   ├── src/
│   │   ├── pipeline/          # Document processing pipeline
│   │   │   ├── processor.py   # PDF/Doc extraction
│   │   │   ├── chunker.py     # Text chunking
│   │   │   └── embedder.py    # Embedding generation
│   │   ├── rag/               # RAG components
│   │   │   ├── context.py     # Context building
│   │   │   ├── search.py      # Vector search
│   │   │   └── rerank.py      # Result reranking
│   │   └── queue/             # Queue consumers
│   └── config/
│
└── shared/                      # Shared configurations/types