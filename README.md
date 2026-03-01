# Schmackofatz

Enter ingredients and get AI-powered recipe suggestions, streamed in real-time.

## Stack

- **App** – Next.js
- **Server** – Java Spring Boot
- **AI** – Llama 3.3 via Groq

## Prerequisites

- Docker
- Groq API Key (free at [console.groq.com](https://console.groq.com))

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and add your Groq API Key
3. Run the server:

```bash
docker compose up --build
```

Server runs on `http://localhost:8080`

## API

`POST /api/recipes/stream` – streams recipe suggestions for a list of ingredients

```bash
curl -N -X POST http://localhost:8080/api/recipes/stream \
  -H "Content-Type: application/json" \
  -d '["tomatoes", "onions", "garlic"]'
```
