import cors from '@fastify/cors';
import Fastify from 'fastify';
import { assignmentRoutes } from './routes/assignmentRoutes.js';
import { attachmentRoutes } from './routes/attachmentRoutes.js';
import { caseRoutes } from './routes/caseRoutes.js';
import { historyRoutes } from './routes/historyRoutes.js';
import { operatorRoutes } from './routes/operatorRoutes.js';
import { sessionRoutes } from './routes/sessionRoutes.js';
import { valueRoutes } from './routes/valueRoutes.js';
import { getOperatorById } from './services/operatorServices.js';

const app = Fastify({ logger: false });

// Global hook to check for x-user-id header
app.addHook('onRequest', async (request, reply) => {
  // Skip header check for OPTIONS requests (for CORS)
  if (request.method === 'OPTIONS') {
    return;
  }

  const userIdHeader = request.headers['x-user-id'];
  if (!userIdHeader) {
    reply.status(401).send({ error: 'x-user-id header is required' });
    return reply;
  }

  // Handle case where header might be an array
  const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
  const currentOperator = await getOperatorById(userId);
  if (!currentOperator) return reply.status(401).send({ error: 'Invalid User ID' });
  // Add userId to request for use in handlers
  request.userId = userId;
});

// Register CORS before routes
app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
});

app.register(caseRoutes);
app.register(assignmentRoutes);
app.register(attachmentRoutes);
app.register(operatorRoutes);
app.register(historyRoutes);
app.register(sessionRoutes);
app.register(valueRoutes);

app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});