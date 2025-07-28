import { FastifyPluginAsync } from 'fastify';
import {
  createValueHandler,
  updateValueHandler,
  deleteValueHandler,
  getValuesHandler
} from '../handlers/valueHandler.js';

export const valueRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/values', getValuesHandler);
  fastify.post('/values', createValueHandler);
  fastify.put('/values/:key', updateValueHandler);
  fastify.delete('/values/:key', deleteValueHandler);
};