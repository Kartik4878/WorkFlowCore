# WorkFlowCore Project

A Node.js and Fastify-based workflow management system.

## Project Structure

```
src/
├── routes/           # API route definitions
├── handlers/         # Request handlers
├── services/         # Business logic services
└── app.ts           # Main application file
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

- **Assignments**: `/assignments/*`
- **Cases**: `/cases/*`
- **History**: `/history/*`
- **Operators**: `/operators/*`
- **Sessions**: `/sessions/*`

The server runs on port 3000 by default.