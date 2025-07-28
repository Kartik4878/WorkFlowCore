import { FastifyRequest, FastifyReply } from 'fastify';
import { getUserSessions } from '../services/sessionService.js';

/**
 * Handler to get all sessions for the current user
 * @param req The Fastify request object
 * @param reply The Fastify reply object
 */
export const getSessionsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  reply.send(getUserSessions(req.userId as string));
};