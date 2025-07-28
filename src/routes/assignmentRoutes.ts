import { FastifyPluginAsync } from 'fastify';
import { getAssignmentHandler, getAssignmentsHandler, getWorkQueueAssignmentsHandler, transferAssignmentHandler } from '../handlers/assignmentHandlers.js';

export const assignmentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/assignments', getAssignmentsHandler);
  fastify.get('/assignments/workqueue/:assignedTo', getWorkQueueAssignmentsHandler);
  fastify.get('/assignments/:assignmentId', getAssignmentHandler);
  fastify.post('/assignments/:assignmentId/transfer', transferAssignmentHandler);
};