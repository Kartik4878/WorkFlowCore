import { FastifyInstance } from 'fastify';
import { uploadAttachmentHandler, getAttachmentsHandler, getAttachmentHandler, deleteAttachmentHandler } from '../handlers/attachmentHandlers.js';

export const attachmentRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(import('@fastify/multipart'));

  fastify.post('/attachments/upload/:caseId', uploadAttachmentHandler);
  fastify.get('/attachments/case/:caseId', getAttachmentsHandler);
  fastify.get('/attachments/:attachmentId', getAttachmentHandler);
  fastify.delete('/attachments/:attachmentId', deleteAttachmentHandler);
};