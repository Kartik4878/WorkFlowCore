import { FastifyRequest, FastifyReply } from 'fastify';
import { createHistory, getCaseHistory } from '../services/historyService.js';

/**
 * Handler for creating a new history record
 * POST /history
 */
export const createHistoryHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { caseId, description } = req.body as any;
  const createdBy = req.userId as string;

  if (!caseId) return reply.status(400).send({ error: 'caseId is required' });
  if (!description) return reply.status(400).send({ error: 'description is required' });
  if (!createdBy) return reply.status(400).send({ error: 'createdBy is required' });

  try {
    reply.send(await createHistory(caseId, description, createdBy));
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while creating history' });
  }
};

/**
 * Handler for getting history records for a specific case
 * GET /history/:caseId
 */
export const getCaseHistoryHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const caseId = (req.params as any).caseId;
  if (!caseId) return reply.status(400).send({ error: 'caseId is required' });

  try {
    reply.send(await getCaseHistory(caseId));
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while getting history' });
  }
};