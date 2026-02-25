---
layout: post
title: "NotebookLM Clone: Building a RAG Chat App with LangGraph, Supabase, and Next.js"
date: 2025-02-25 00:00:00 -0000
categories: [AI, RAG, LangGraph, Next.js]
---

## Introduction

**NotebookLM** by Google lets you upload documents and chat with an AI that answers questions using only your uploaded content. This post documents a full-stack clone that replicates that experience: upload PDFs or paste text, then ask questions and get answers grounded in your documents—no hallucination from external knowledge.

The project combines **LangGraph** for orchestration, **Supabase** for vector storage, **Vertex AI** (or Ollama) for embeddings and chat models, and **Next.js** for the frontend. The result is a production-ready RAG (Retrieval-Augmented Generation) application with per-chat document scoping, streaming responses, and a clean chat UI.

## Project Overview

### Key Features

- **Document upload**: PDF files (up to 2MB) and raw text snippets
- **Per-chat document scoping**: Each chat thread has its own document set; retrieval only uses documents from that thread
- **Smart routing**: An LLM decides whether to retrieve from documents or answer directly (e.g., general knowledge questions)
- **Streaming responses**: Server-Sent Events (SSE) for real-time token streaming
- **Chat history**: Multiple sessions with sidebar, edit/retry, and session persistence
- **Dual model support**: Vertex AI (Gemini) by default, or local Ollama for development

### Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Next.js Frontend (React 19, Tailwind)                                   │
│  ├── /api/upload  → POST PDFs or text                                   │
│  ├── /api/chat    → POST message, stream SSE                             │
│  └── /api/documents → GET list, DELETE remove                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LangGraph Server (LangGraph SDK)                                        │
│  ├── upload_graph   → PDF/text → chunk → embed → Supabase                │
│  └── retrieval_graph → route → retrieve/answer → stream                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL + pgvector)                                        │
│  documents table: id, content, embedding, metadata (thread_id, filename) │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, React Markdown, KaTeX |
| Backend | LangGraph, LangGraph SDK |
| Embeddings | Vertex AI Gemini Embedding 001 (768d) or Ollama nomic-embed-text |
| Chat Models | Vertex AI Gemini 2.5 Flash or Ollama gemma3:4b |
| Vector Store | Supabase (pgvector) |
| PDF Parsing | pdf-parse, LangChain PDFLoader |

## Project Structure

```
notebooklm-clone/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # SSE streaming chat
│   │   │   ├── upload/route.ts    # PDF/text upload
│   │   │   └── documents/route.ts # list/delete docs
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Messages.tsx
│   │   ├── MessageInput.tsx
│   │   ├── Sidebar.tsx
│   │   ├── AddTextModal.tsx
│   │   └── file-preview.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   └── useChatHistory.ts
│   └── lib/
│       ├── langgraph.ts
│       └── utils/sse.ts
├── backend/
│   ├── src/
│   │   ├── retrieval_graph/
│   │   │   ├── graph.ts
│   │   │   ├── prompts.ts
│   │   │   └── utils.ts
│   │   ├── upload_graph/
│   │   │   └── graph.ts
│   │   └── shared/
│   │       ├── retrieval.ts
│   │       ├── pdf.ts
│   │       ├── state.ts
│   │       └── configuration.ts
│   └── langgraph.json
└── tests/
    └── load-test.js
```

## LangGraph Architecture

The backend exposes two graphs via `langgraph.json`:

```json
{
  "node_version": "22",
  "graphs": {
    "upload_graph": "./src/upload_graph/graph.ts:graph",
    "retrieval_graph": "./src/retrieval_graph/graph.ts:graph"
  },
  "dependencies": ["."]
}
```

### Upload Graph

The upload graph handles document ingestion and management:

1. **checkOperation** – Determines whether the request is `upload`, `list`, or `delete`
2. **uploadDocs** – For PDFs: decode base64 → temp file → PDFLoader → chunk → embed → Supabase. For text: create a single document with `source: user_text` and `text_id`
3. **manageDocuments** – For `list`: query Supabase by `thread_id`, return files and text sources. For `delete`: remove documents by `filename` or `text_id`

All documents are tagged with `thread_id` in metadata so retrieval is scoped per chat.

**Chunking configuration**:

```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1500,
  chunkOverlap: 200,
});
const splitDocs = await splitter.splitDocuments(docs);
```

**Rate limiting**: The upload graph uses batched embedding (20 docs per batch) with retry and exponential backoff for Vertex AI rate limits.

### Retrieval Graph

The retrieval graph implements the RAG flow with intelligent routing:

```
START → checkQueryType → route
              │
              ├── retrieve → retrieveDocuments → generateResponse → END
              │
              └── direct   → directAnswer → END
```

1. **checkQueryType** – An LLM with structured output decides: `retrieve` (needs documents) or `direct` (general knowledge).
2. **routeQuery** – Maps the decision to `retrieveDocuments` or `directAnswer`.
3. **retrieveDocuments** – Invokes the Supabase retriever with `thread_id` filter, returns top-k chunks.
4. **generateResponse** – Formats chunks as context, invokes the chat model with a strict “answer only from context” prompt.
5. **directAnswer** – For general questions, invokes the model with conversation history only (no retrieval).

**Router prompt (excerpt)**:

```
Select 'retrieve' ONLY if:
- The question asks for specific details, facts, policies, procedures...
- It refers to internal company information, product specifications...
- The question mentions or implies reliance on uploaded files...

Select 'direct' if:
- The question involves general knowledge, reasoning, creative tasks...
- No specific document or proprietary information is required.
```

**Response prompt**:

```
Answer the user's question using ONLY the provided context below.
- Base the answer exclusively on the retrieved context.
- Never add or invent information not supported by the context.
- If the context lacks sufficient information, respond with "I don't have sufficient information..."
```

## Configuration and Model Selection

The backend supports two modes via `USE_OLLAMA`:

- **Cloud (default)**: Vertex AI Gemini 2.5 Flash for chat, Gemini Embedding 001 for embeddings
- **Local**: Ollama with `gemma3:4b` and `nomic-embed-text:latest`

```typescript
const getDefaultQueryModel = (): string => {
  const useOllama = process.env.USE_OLLAMA === "true";
  if (useOllama) {
    return "ollama/gemma3:4b";
  } else {
    return "vertexai/gemini-2.5-flash";
  }
};
```

Retrieval configuration is passed from the frontend:

```typescript
export const retrievalAssistantConfig = {
  queryModel: "vertexai/gemini-2.5-flash",
  retrieverProvider: "supabase",
  filterKwargs: {},
  k: 5,
};
```

The chat API injects `thread_id` into `filterKwargs` so the retriever only fetches documents for the current chat.

## Frontend Implementation

### Chat Flow

1. **Thread creation**: On mount, `useChat` creates a thread via `client.threads.create({ graphId: "retrieval_graph" })`.
2. **Message send**: User submits → `POST /api/chat` with `message`, `threadId`, and optional `messagesBeforeEdit` (for edit/retry).
3. **State sync**: Before streaming, the API calls `client.threads.updateState(threadId, { values: { messages } })` so the graph has conversation history.
4. **Streaming**: `client.runs.stream(threadId, assistantId, { input: { query }, streamMode: ["messages", "updates"] })` returns an async iterator; the API encodes chunks as SSE and streams to the client.
5. **Client parsing**: `readSSEStream` and `parseSSEMessageChunk` extract content; the UI appends to the last assistant message for live streaming.

### SSE Handling

The chat API returns `text/event-stream` with JSON payloads:

```typescript
const eventStream = await client.runs.stream(threadId, targetAssistantId, {
  input: { query: message },
  streamMode: ["messages", "updates"],
  config: { configurable: configWithThread },
});

const sseStream = new ReadableStream({
  async start(controller) {
    for await (const chunk of eventStream) {
      controller.enqueue(encoder.encode(`data ${JSON.stringify(chunk)}\n\n`));
    }
    controller.close();
  },
});
```

The frontend filters out classifier output from `checkQueryType` so only the final answer is shown.

### Upload Flow

- **PDF**: FormData with `files` → convert to base64 → `client.runs.create(threadId, "upload_graph", { input: { pdfFile, threadId } })` → poll until run completes.
- **Text**: JSON body `{ text, threadId?, textId? }` → same `upload_graph` with `textContent` and `textId`.

If no `threadId` is provided, the API creates a new thread and returns it; the frontend switches to that thread and loads its document list.

### Document Management

- **List**: `GET /api/documents?threadId=...` → invokes upload graph with `operation: "list"` → returns `{ files, textSources }`.
- **Delete**: `DELETE /api/documents?threadId=...&type=file&filename=...` or `type=text&textId=...` → upload graph with `operation: "delete"`.

## Key Implementation Details

### Per-Thread Document Scoping

Every document row in Supabase includes `thread_id` in metadata. The retriever receives `filterKwargs: { thread_id: threadId }`, so each chat only sees its own documents. This mirrors NotebookLM’s notebook-scoped behavior.

### Edit and Retry

When the user edits a prior message, the frontend sends `messagesBeforeEdit` (messages before the edit). The API updates thread state with those messages, then runs the graph with the new query. The model sees the corrected context and generates a new response.

### Stop Generation

The frontend tracks `run_id` from SSE metadata. On stop, it calls `client.runs.cancel(threadId, runId)` and aborts the fetch. Partial content is preserved in the UI.

### PDF Processing

PDFs are sent as base64 from the browser. The backend decodes to a buffer, writes to a temp file, uses LangChain’s `PDFLoader`, then deletes the temp file. Each chunk gets `filename` in metadata for source attribution.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side access |
| `GOOGLE_CLOUD_PROJECT_ID` | GCP project for Vertex AI |
| `GOOGLE_CLOUD_LOCATION` | Region (e.g., asia-south1) |
| `USE_OLLAMA` | Set to `"true"` for local Ollama |
| `OLLAMA_BASE_URL` | Ollama server URL (default localhost:11434) |
| `NEXT_PUBLIC_LANGGRAPH_API_URL` | LangGraph server URL (default localhost:2024) |

## Supabase Schema

The `documents` table uses pgvector for similarity search:

- `id`: Primary key
- `content`: Chunk text
- `embedding`: Vector (768 dimensions for Vertex AI)
- `metadata`: JSON with `thread_id`, `filename` (for PDFs), `source`, `text_id` (for user text)

A `match_documents` function is used for the retriever query.

## Takeaways

- **LangGraph** provides a clean way to model RAG as a graph: routing, retrieval, and generation as separate nodes with clear state flow.
- **Per-thread document scoping** via `thread_id` in metadata keeps chats isolated and avoids cross-contamination.
- **Smart routing** reduces unnecessary retrieval for general questions and improves latency.
- **SSE streaming** gives a responsive chat experience with real-time token display.
- **Dual model support** (Vertex AI vs Ollama) makes it easy to develop locally and deploy to the cloud.

The NotebookLM clone demonstrates a production-ready RAG stack: document upload, chunking, embedding, retrieval, and chat—all orchestrated by LangGraph and delivered through a modern Next.js frontend.
