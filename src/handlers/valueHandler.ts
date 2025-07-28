import { FastifyReply, FastifyRequest } from "fastify";
import { 
  createValue, 
  updateValue, 
  deleteValue, 
  getValuesByType, 
  getValuesByWorkGroup, 
  getValuesByTypeAndWorkGroup, 
  getAllValues 
} from "../services/valueServices.js";

export const createValueHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const valueData = { ...req.body as any, createdBy: req.userId as string };
  
  try {
    reply.send(await createValue(valueData));
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while creating value' });
  }
};

export const updateValueHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const key = (req.params as any).key;
  const valueData = { ...req.body as any, updatedBy: req.userId as string };
  
  try {
    reply.send(await updateValue(key, valueData));
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while updating value' });
  }
};

export const deleteValueHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const key = (req.params as any).key;
  
  try {
    const result = await deleteValue(key);
    reply.send({ success: result });
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while deleting value' });
  }
};

export const getValuesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { type, workGroup } = req.query as any;
  
  try {
    if (type && workGroup) {
      const workGroups = Array.isArray(workGroup) ? workGroup : workGroup.split(',');
      reply.send(await getValuesByTypeAndWorkGroup(type, workGroups));
    } else if (type) {
      reply.send(await getValuesByType(type));
    } else if (workGroup) {
      const workGroups = Array.isArray(workGroup) ? workGroup : workGroup.split(',');
      reply.send(await getValuesByWorkGroup(workGroups));
    } else {
      reply.send(await getAllValues());
    }
  } catch (error) {
    reply.status(400).send({ error: 'Something went wrong while fetching values' });
  }
};