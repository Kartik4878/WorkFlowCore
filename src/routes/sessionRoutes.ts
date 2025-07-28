import { FastifyPluginAsync } from 'fastify';
import { getSessionsHandler } from '../handlers/sessionHandlers.js';

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/sessions', getSessionsHandler);
};