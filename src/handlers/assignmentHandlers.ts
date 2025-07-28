import { FastifyReply, FastifyRequest } from 'fastify';
import { getWorkQueueAssignments, getAssignmentById, transferAssignment, getMyAssignments } from '../services/assignmentService.js';
import { createSession, getCaseSessions } from '../services/sessionService.js';
import { getOperatorById } from '../services/operatorServices.js';
import { getAssignmentStatus } from '../validators/assignmentValidators.js';
import { getValuesByType } from '../services/valueServices.js';

export const getAssignmentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { assignmentId } = req.params as any;
    const assignment = await getAssignmentById(assignmentId);

    if (!assignment) return reply.status(404).send({ error: 'Assignment not found' });

    const status = await getAssignmentStatus(assignment, req.userId as string);
    if (!status.canAccess) {
      return reply.status(status.errorCode!).send({ error: status.errorMessage });
    }

    const sessions = await getCaseSessions(assignment.caseId);
    if (sessions.length === 0) {
      await createSession(assignment.caseId, req.userId as string);
    }

    if (assignment.metadata && typeof assignment.metadata === 'object') {
      for (const key in assignment.metadata) {
        const field = (assignment.metadata as any)[key];
        if (field.values && field.values.length > 0) {
          const type = field.values[0].key;
          const values = await getValuesByType(type);
          field.values = values.map(v => ({ value: v.value, label: v.label }));
        }
      }
    }

    reply.send(assignment);
  } catch (error) {
    console.error('Error getting assignment:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const transferAssignmentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { assignmentId } = req.params as any;
  const { operatorId, routeToType } = req.body as any;

  if (!assignmentId) return reply.status(400).send({ error: 'assignmentId is required' });
  if (!operatorId) return reply.status(400).send({ error: 'Operator ID is required' });
  if (!routeToType) return reply.status(400).send({ error: 'Route to type is required' });

  try {
    if (routeToType === "Operator") {
      await getOperatorById(operatorId);
    } else if (routeToType === "WorkQueue") {
      const currentOperator = await getOperatorById(req.userId as string);
      if (!currentOperator || !(currentOperator.workQueues as string[]).includes(operatorId)) {
        return reply.status(400).send({ error: 'Invalid WorkQueue.' });
      }
    } else {
      return reply.status(400).send({ error: 'Route to type can either be Operator or WorkQueue' });
    }

    const updatedAssignment = await transferAssignment(assignmentId, operatorId, routeToType, req.userId as string);
    reply.send(updatedAssignment);
  } catch (error) {
    const errorMsg = routeToType === "Operator" ? 'Invalid Operator.' : 'Something went wrong while getting operator.';
    return reply.status(error instanceof Error && error.message.includes('transfer') ? 500 : 400)
      .send({ error: error instanceof Error && error.message.includes('transfer') ? `Error transferring assignment: ${error}` : errorMsg });
  }
};

export const getAssignmentsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    reply.send(await getMyAssignments(req.userId as string));
  } catch (error) {
    console.error('Error getting assignments:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const getWorkQueueAssignmentsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { assignedTo } = req.params as any;
    reply.send(await getWorkQueueAssignments([assignedTo]));
  } catch (error) {
    console.error('Error getting work queue assignments:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
};



