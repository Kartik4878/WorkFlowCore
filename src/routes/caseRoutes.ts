import { FastifyPluginAsync } from 'fastify';
import {
    createCaseHandler,
    nextHandler,
    previousHandler,
    getAllCasesHandler,
    getCaseHandler,
    getCaseTypesHandler,
    saveHandler,
    closeCaseHandler,
    getCaseTypeSchemaHandler,
    postCaseTypeSchemaHandler,
    addCaseTypeSchemaHandler
} from '../handlers/caseHandlers.js';

export const caseRoutes: FastifyPluginAsync = async (fastify) => {
    // Case collection endpoints
    fastify.get('/cases', getAllCasesHandler);
    fastify.post('/cases', createCaseHandler);
    fastify.post('/cases/close', closeCaseHandler);

    // Case type endpoints
    fastify.get('/cases/types', getCaseTypesHandler);
    fastify.post('/cases/types', addCaseTypeSchemaHandler);
    fastify.get('/cases/types/:schemaID', getCaseTypeSchemaHandler);
    fastify.put('/cases/types/:schemaID', postCaseTypeSchemaHandler);

    // Individual case endpoints
    fastify.get('/cases/:caseId', getCaseHandler);
    fastify.post('/cases/:caseId/next', nextHandler);
    fastify.post('/cases/:caseId/previous', previousHandler);
    fastify.post('/cases/:caseId/save', saveHandler);
};