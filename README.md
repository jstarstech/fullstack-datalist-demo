# Demo Node.js + React Test Project

This project is a full-stack demo application featuring:
- A Node.js + Express backend with EJS support and a REST API.
- A React frontend (with react-window for virtualization and dnd-kit for drag-and-drop).
- Massive list support (1,000,000 items).
- Multi-select with shift-click.
- Drag-and-drop reordering.
- Docker and Docker Compose support.

## Features

- **Backend**: Express.js, EJS, REST API for items, selection, and ordering.
- **Frontend**: React, react-window, dnd-kit, multi-checkbox select, shift-click range select, drag-and-drop.
- **Persistence**: In-memory (per server run).
- **Dockerized**: Build and run with Docker Compose or stanalone.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for local dev)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized run)

### Local Development

Clone the repository:

```bash
git clone https://github.com/jstarstech/fullstack-datalist-demo.git
cd fullstack-datalist-demo
```

Copy the example environment file:

```bash
cp .env.example .env
```

#### Backend

```bash
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Backend runs on [http://localhost:3000](http://localhost:3000)
- Frontend runs on [http://localhost:3001](http://localhost:3001) (proxy to backend)

### Docker Compose

To build and run everything in Docker:

```bash
docker-compose up --build
```

- App will be available at [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /api/items?offset=0&limit=20&search=` — Get paginated, ordered, and filtered items.
- `POST /api/select` — Select/deselect items for a client.
- `POST /api/order` — Update order of items.
- `GET /api/state?clientId=...` — Get selected item IDs for a client.
