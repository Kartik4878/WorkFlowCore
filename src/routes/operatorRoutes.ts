import { FastifyPluginAsync } from 'fastify';
import {
    getAllOperatorsHandler,
    getAllWorkQueuesHandler,
    getOperatorHandler,
    updateOperatorHandler,
    createOperatorHandler,
    deleteOperatorHandler

} from '../handlers/operatorHandler.js';


export const operatorRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/operators', getAllOperatorsHandler);
    fastify.get('/operators/operator', getOperatorHandler);
    fastify.get('/operators/workqueues', getAllWorkQueuesHandler);
    fastify.put('/operators/:operatorId', updateOperatorHandler);
    fastify.post('/operators/:operatorId', createOperatorHandler);
    fastify.delete('/operators/:operatorId', deleteOperatorHandler);
};