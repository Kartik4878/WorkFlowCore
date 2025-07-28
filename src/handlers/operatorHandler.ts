import { FastifyReply, FastifyRequest } from "fastify";
import { getOperatorById, getOperators, getWorkqueues, isOperatorAdmin, updateOperator, createOperator, deleteOperator } from "../services/operatorServices.js";
import { getCaseTypeIDs } from "../services/caseService.js";

export const getOperatorHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const operatorId = req.userId as string;
  if (!operatorId) return reply.status(400).send({ error: 'Operator ID is required' });

  const operatorDetails = await getOperatorById(operatorId);
  if (!operatorDetails) return reply.status(400).send({ error: 'Operator not found!' });

  reply.send(operatorDetails);
}

export const getAllOperatorsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  reply.send(await getOperators());
};

export const getAllWorkQueuesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  reply.send(await getWorkqueues());
};

const validateOperatorRequest = async (req: FastifyRequest, reply: FastifyReply) => {
  if (!isOperatorAdmin(req.userId as string)) {
    reply.status(401).send({ error: 'Admin access is required.' });
    return null;
  }

  const operatorId = (req.params as any).operatorId;
  const operatorData = req.body as any;

  if (!operatorId) {
    reply.status(400).send({ error: 'Operator ID is required' });
    return null;
  }
  if (!operatorData) {
    reply.status(400).send({ error: 'Operator data is required' });
    return null;
  }
  if (operatorData.operatorId !== operatorId) {
    reply.status(400).send({ error: 'Operator ID in data does not match URL parameter' });
    return null;
  }

  if (operatorData.workQueues && Array.isArray(operatorData.workQueues)) {
    const workQueues = await getWorkqueues();
    const invalidWorkQueue = operatorData.workQueues.find((queue: string) =>
      !workQueues.some(workQueue => workQueue.key === queue)
    );
    if (invalidWorkQueue) {
      reply.status(404).send({ error: `Invalid Work Queue: ${invalidWorkQueue}` });
      return null;
    }
  }

  if (operatorData.workGroups && Array.isArray(operatorData.workGroups)) {
    const workGroups = await getCaseTypeIDs();
    const invalidWorkGroup = operatorData.workGroups.find((workGroup: string) =>
      !workGroups.includes(workGroup)
    );
    if (invalidWorkGroup) {
      reply.status(404).send({ error: `Invalid Work Group: ${invalidWorkGroup}` });
      return null;
    }
  }

  return { operatorId, operatorData };
};

export const updateOperatorHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const validation = await validateOperatorRequest(req, reply);
  if (!validation) return;

  const { operatorId, operatorData } = validation;

  try {
    reply.send(await updateOperator(operatorId, operatorData));
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while updating operator' });
  }
};

export const createOperatorHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const validation = await validateOperatorRequest(req, reply);
  if (!validation) return;

  const { operatorData } = validation;

  try {
    operatorData.createdBy = req.userId as string;
    operatorData.updatedBy = req.userId as string;
    reply.send(await createOperator(operatorData));
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while creating operator' });
  }
};


export const deleteOperatorHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  if (!isOperatorAdmin(req.userId as string)) {
    reply.status(401).send({ error: 'Admin access is required.' });
    return null;
  }
  const operatorId = (req.params as any).operatorId;
  try {
    reply.send(await deleteOperator(operatorId));
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while deleting operator' });
    console.log(error);
  }
};
