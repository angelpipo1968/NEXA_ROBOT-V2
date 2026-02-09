# Nexa AI Monorepo

## Structure
- `apps/web`: Next.js Frontend
- `apps/api`: Hono + Node.js Backend
- `packages/core`: Core logic
- `packages/memory`: Memory management
- `packages/tools`: Tools and utilities
- `infra`: Infrastructure (Docker, deployment)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start infrastructure:
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

3. Run development mode:
   ```bash
   npm run dev
   ```
