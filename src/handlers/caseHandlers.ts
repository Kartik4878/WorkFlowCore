import { FastifyReply, FastifyRequest } from 'fastify';
import { AssignmentInstance } from '../models/AssignmentInstance.js';
import { CaseInstance } from '../models/CaseInstance.js';
import { deleteAssignment, getAssignmentById, saveAssignment } from '../services/assignmentService.js';
import { closeCase, createCase, createCaseSchema, getCaseById, getCases, getCaseTypeIDs, getCaseTypeSchema, saveCase, updateCaseSchema } from '../services/caseService.js';
import { createHistory } from '../services/historyService.js';
import { getOperatorById, isOperatorAdmin } from '../services/operatorServices.js';
import { deleteSession } from '../services/sessionService.js';
import { evaluateCondition } from '../utils/conditionUtils.js';
import { getAssignmentStatus } from '../validators/assignmentValidators.js';
import { validateWorkflowSchema } from '../validators/schemaValidators.js';
import { validateAssignmentSubmission } from '../validators/submitAssignmentValidation.js';

export const createCaseHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { caseTypeId, metadata } = req.body as any;
  const userId = req.userId as string;

  if (!caseTypeId) return reply.status(400).send({ error: 'caseTypeId is required' });

  try {
    const [currentOperator, schema] = await Promise.all([
      getOperatorById(userId),
      getCaseTypeSchema(caseTypeId) as any
    ]);

    if (!currentOperator || !(currentOperator.workGroups as string[]).includes(caseTypeId)) {
      return reply.status(400).send({ error: 'You are not allowed to create this case.' });
    }

    if (!schema) return reply.status(400).send({ error: 'Invalid case type' });

    // Step 1: Create case
    let newCase;
    try {
      const caseInstance = new CaseInstance(schema, userId);
      newCase = await createCase(caseInstance);
    } catch (error) {
      console.error('Error creating case:', error);
      return reply.status(400).send({ error: 'Failed to create case' });
    }

    // Step 2: Create assignment
    let initialAssignment;
    try {
      const firstProcess = Object.keys(schema.processes)[0];
      const firstAssignmentKey = schema.processes[firstProcess].assignments[0];
      initialAssignment = new AssignmentInstance(newCase.caseId, firstProcess, firstAssignmentKey, schema, userId);
      await saveAssignment(initialAssignment);
    } catch (error) {
      console.error('Error creating assignment:', error);
      return reply.status(400).send({ error: 'Failed to create assignment' });
    }

    // Step 3: Save case with assignment
    try {
      newCase.status = initialAssignment.status;
      newCase.currentAssignmentId = initialAssignment.assignmentId;
      Object.assign(newCase.metadata!, metadata);
      await saveCase(newCase);
    } catch (error) {
      console.error('Error saving case:', error);
      return reply.status(400).send({ error: 'Failed to save case' });
    }

    // Step 4: Create history (non-critical)
    try {
      createHistory(newCase.caseId, `New case created by: ${userId}`, userId);
    } catch (error) {
      console.log('Error creating history:', error);
    }

    reply.send(newCase);
  } catch (error) {
    console.error('Unexpected error in createCaseHandler:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const nextHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const caseId = (req.params as any).caseId;
  const updates = req.body as Record<string, any>;

  try {
    const currentCase = await getCaseById(caseId);
    if (!currentCase) {
      return reply.status(404).send({ error: 'Case not found' });
    }

    const currentAssignment = await getAssignmentById(currentCase.currentAssignmentId!);
    if (!currentAssignment) {
      return reply.status(400).send({ error: 'Assignment not found' });
    }

    const status = await getAssignmentStatus(currentAssignment, req.userId as string);
    if (!status.canAccess) {
      return reply.status(status.errorCode as number).send({ error: status.errorMessage });
    }
    const schema: any = await getCaseTypeSchema(currentCase.caseTypeId!);
    if (currentAssignment.isStrict) {
      const validation = await validateAssignmentSubmission(currentAssignment.metadata, updates);
      if (!validation.isValid) {
        return reply.status(400).send({ error: 'Validation failed', details: validation.errors });
      }
    }
    Object.assign(currentCase.metadata!, updates);
    const { processId, assignmentKey } = currentAssignment;

    const processAssignments = schema.processes[processId]?.assignments || [];
    let nextIndex = processAssignments.indexOf(assignmentKey) + 1;
    let nextAssignmentKey = null;
    let nextProcessId = processId;

    while (nextIndex < processAssignments.length) {
      const candidateAssignmentKey = processAssignments[nextIndex];
      const assignmentCondition = schema.processes[processId].assignmentConfigs[candidateAssignmentKey]?.condition;

      if (evaluateCondition(assignmentCondition, currentCase)) {
        nextAssignmentKey = candidateAssignmentKey;
        break;
      } else {
        try {
          await createHistory(currentCase.caseId, `Case assignment skipped: ${candidateAssignmentKey}`, req.userId as string);
        } catch (error) {
          console.log('Error creating history:', error);
        }
      }
      nextIndex++;
    }

    if (!nextAssignmentKey) {
      const processIds = Object.keys(schema.processes);
      let nextProcessIdx = processIds.indexOf(processId) + 1;

      while (nextProcessIdx < processIds.length) {
        const candidateProcessId = processIds[nextProcessIdx];
        const processCondition = schema.processes[candidateProcessId]?.condition;

        if (evaluateCondition(processCondition, currentCase)) {
          nextProcessId = candidateProcessId;
          const nextProcessAssignments = schema.processes[nextProcessId]?.assignments || [];
          let assignmentIdx = 0;

          while (assignmentIdx < nextProcessAssignments.length) {
            const candidateAssignmentKey = nextProcessAssignments[assignmentIdx];
            const assignmentCondition = schema.processes[nextProcessId].assignmentConfigs[candidateAssignmentKey]?.condition;

            if (evaluateCondition(assignmentCondition, currentCase)) {
              nextAssignmentKey = candidateAssignmentKey;
              break;
            } else {
              try {
                await createHistory(currentCase.caseId, `Case assignment skipped: ${candidateAssignmentKey}`, req.userId as string);
              } catch (error) {
                console.log('Error creating history:', error);
              }
            }
            assignmentIdx++;
          }

          if (nextAssignmentKey) break;
        } else {
          try {
            await createHistory(currentCase.caseId, `Case process skipped: ${candidateProcessId}`, req.userId as string);
          } catch (error) {
            console.log('Error creating history:', error);
          }
        }
        nextProcessIdx++;
      }

      if (!nextAssignmentKey) {
        try {
          currentCase.currentAssignmentId = null;
          currentCase.status = schema?.processes[processId].completionStatus || 'Resolved';
          currentCase.updatedBy = req.userId as string;
          await saveCase(currentCase);
        } catch (error) {
          console.error('Error resolving case:', error);
          return reply.status(400).send({ error: 'Failed to resolve case' });
        }

        try {
          await createHistory(currentCase.caseId, `Case resolved by: ${req.userId}`, req.userId as string);
        } catch (error) {
          console.log('Error creating history:', error);
        }
      }
    }

    try {
      await deleteAssignment(currentAssignment.assignmentId);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return reply.status(400).send({ error: 'Failed to delete assignment' });
    }

    if (nextAssignmentKey && nextProcessId) {
      try {
        const newAssignment = new AssignmentInstance(currentCase.caseId, nextProcessId, nextAssignmentKey, schema, req.userId as string, "");
        await saveAssignment(newAssignment);
        currentCase.status = newAssignment.status || schema.processes[processId].completionStatus;
        currentCase.updatedAt = new Date();
        currentCase.updatedBy = req.userId as string;
        currentCase.currentAssignmentId = newAssignment.assignmentId;
        await saveCase(currentCase);
      } catch (error) {
        console.error('Error creating new assignment:', error);
        return reply.status(400).send({ error: 'Failed to create new assignment' });
      }

      try {
        await createHistory(currentCase.caseId, `Case moved forward by: ${req.userId}`, req.userId as string);
      } catch (error) {
        console.log('Error creating history:', error);
      }
    }

    try {
      await deleteSession(currentCase.caseId, req.userId as string);
    } catch (error) {
      console.log('Error deleting session:', error);
    }

    reply.send(currentCase);
  } catch (error) {
    console.error('Unexpected error in nextHandler:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const previousHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const caseId = (req.params as any).caseId;

  try {
    const currentCase = await getCaseById(caseId);
    if (!currentCase) {
      return reply.status(404).send({ error: 'Case not found' });
    }

    const currentAssignment = await getAssignmentById(currentCase.currentAssignmentId!);
    if (!currentAssignment) {
      return reply.status(400).send({ error: 'Assignment not found' });
    }
    if (!currentAssignment.isPreviousActionAllowed) {
      return reply.status(400).send({ error: 'Moving to Previous screen is not allowed.' });
    }
    const status = await getAssignmentStatus(currentAssignment, req.userId as string);
    if (!status.canAccess) {
      return reply.status(status.errorCode as number).send({ error: status.errorMessage });
    }

    const schema: any = await getCaseTypeSchema(currentCase.caseTypeId);
    const { processId, assignmentKey } = currentAssignment;

    const processAssignments = schema.processes[processId]?.assignments || [];
    const currentIdx = processAssignments.indexOf(assignmentKey);
    let previousIdx = currentIdx - 1;
    let previousAssignmentKey = null;
    let previousProcessId = processId;

    while (previousIdx >= 0) {
      const candidateAssignmentKey = processAssignments[previousIdx];
      const assignmentCondition = schema.processes[processId].assignmentConfigs[candidateAssignmentKey]?.condition;

      if (evaluateCondition(assignmentCondition, currentCase)) {
        previousAssignmentKey = candidateAssignmentKey;
        break;
      }
      previousIdx--;
    }

    if (previousAssignmentKey) {
      try {
        await deleteAssignment(currentAssignment.assignmentId);
      } catch (error) {
        console.error('Error deleting assignment:', error);
        return reply.status(400).send({ error: 'Failed to delete assignment' });
      }

      try {
        const newAssignment = new AssignmentInstance(currentCase.caseId, previousProcessId, previousAssignmentKey, schema, req.userId as string, "");
        await saveAssignment(newAssignment);
        currentCase.status = newAssignment.status || schema.processes[processId].status;
        currentCase.updatedAt = new Date();
        currentCase.updatedBy = req.userId as string;
        currentCase.currentAssignmentId = newAssignment.assignmentId;
        await saveCase(currentCase);
      } catch (error) {
        console.error('Error creating previous assignment:', error);
        return reply.status(400).send({ error: 'Failed to create previous assignment' });
      }

      try {
        await createHistory(currentCase.caseId, `Case moved backward by: ${req.userId}`, req.userId as string);
      } catch (error) {
        console.log('Error creating history:', error);
      }
    }

    reply.send(currentCase);
  } catch (error) {
    console.error('Unexpected error in previousHandler:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const getCasesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.send(await getCases());
  } catch (error) {
    console.error('Error getting cases:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const getCaseByIdHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const caseId = (req.params as any).caseId;
    const caseData = await getCaseById(caseId);
    if (!caseData) return reply.status(404).send({ error: 'Case not found' });

    reply.send(caseData);
  } catch (error) {
    console.error('Error getting case by ID:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};


export const saveHandler = async (req: FastifyRequest<{ Params: { caseId: string }; Body: Record<string, any> }>, reply: FastifyReply) => {
  const currentCase = await getCaseById(req.params.caseId);
  if (!currentCase) {
    return reply.status(404).send({ error: 'Case not found' });
  }

  Object.assign(currentCase.metadata!, req.body);
  await saveCase(currentCase);
  await createHistory(req.params.caseId, `Case saved by: ${req.userId}`, req.userId as string);

  reply.send(currentCase);
};


export const closeCaseHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const caseId = (req.params as any).caseId;
    const userId = req.userId as string;
    const success = await closeCase(caseId, userId);
    if (!success) return reply.status(400).send({ error: 'Failed to close case' });

    reply.send({ message: 'Case closed successfully' });
  } catch (error) {
    console.error('Error closing case:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const getCaseTypeIDsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.send(await getCaseTypeIDs());
  } catch (error) {
    console.error('Error getting case type IDs:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const pullCaseTypeSchemaHandler = async (req: FastifyRequest<{ Params: { schemaID: string } }>, reply: FastifyReply) => {
  try {
    const schema = await getCaseTypeSchema(req.params.schemaID);
    if (!schema) return reply.status(404).send({ error: 'Schema not found' });
    reply.send(schema);
  } catch (error) {
    console.error('Error getting case type schema:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const updateCaseSchemaHandler = async (req: FastifyRequest<{ Params: { schemaID: string } }>, reply: FastifyReply) => {
  if (!isOperatorAdmin(req.userId as string)) {
    return reply.status(403).send({ error: 'Admin access required' });
  }

  const validation = await validateWorkflowSchema(req.body);
  if (!validation.isValid) {
    return reply.status(400).send({ error: 'Schema validation failed', details: validation.errors });
  }

  const success = await updateCaseSchema(req.params.schemaID, req.body, req.userId as string);

  if (!success) {
    return reply.status(404).send({ error: 'Schema not found' });
  }

  reply.send({ message: 'Schema updated successfully' });
};

export const createCaseSchemaHandler = async (req: FastifyRequest<{ Body: { id: string } }>, reply: FastifyReply) => {
  if (!isOperatorAdmin(req.userId as string)) {
    return reply.status(403).send({ error: 'Admin access required' });
  }

  const validation = await validateWorkflowSchema(req.body);
  if (!validation.isValid) {
    return reply.status(400).send({ error: 'Schema validation failed', details: validation.errors });
  }

  const success = await createCaseSchema(req.body.id, req.body, req.userId as string);

  if (!success) {
    return reply.status(400).send({ error: 'Schema already exists' });
  }

  reply.send({ message: 'Schema created successfully' });
};



// Aliases for route compatibility
export const getAllCasesHandler = getCasesHandler;
export const getCaseHandler = getCaseByIdHandler;
export const getCaseTypesHandler = getCaseTypeIDsHandler;
export const postCaseTypeSchemaHandler = updateCaseSchemaHandler;
export const addCaseTypeSchemaHandler = createCaseSchemaHandler;
export const getCaseTypeSchemaHandler = pullCaseTypeSchemaHandler;

