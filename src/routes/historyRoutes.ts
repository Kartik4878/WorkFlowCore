import { FastifyPluginAsync } from 'fastify';
import {
    createHistoryHandler,
    getCaseHistoryHandler
} from '../handlers/historyHandlers.js';

export const historyRoutes: FastifyPluginAsync = async (fastify) => {
    // Create a new history record
    fastify.post('/history', createHistoryHandler);
    
    // Get history records for a specific case
    fastify.get('/history/:caseId', getCaseHistoryHandler);
};