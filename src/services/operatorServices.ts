import prisma from '../prisma/client.js';
import { OperatorInstance } from '../models/OperatorInstance.js';

export const getOperatorById = async (operatorId: string) => {
  return await prisma.operator.findUnique({
    where: { operatorId }
  });
};

export const getOperators = async () => {
  return await prisma.operator.findMany();
};

export const getWorkqueues = async () => {
  return await prisma.workQueue.findMany();
};

export const isOperatorAdmin = async (operatorId: string) => {
  const operator = await prisma.operator.findUnique({
    where: { operatorId }
  });
  return operator?.role === 'Admin';
};

export const updateOperator = async (operatorId: string, operatorData: any) => {
  const operator = await prisma.operator.update({
    where: { operatorId },
    data: {
      userName: operatorData.userName,
      workGroups: operatorData.workGroups,
      workQueues: operatorData.workQueues,
      role: operatorData.role,
      updatedBy: operatorData.updatedBy
    }
  });
  return operator;
};

export const createOperator = async (operatorData: any) => {
  const { operatorId, userName, workGroups, workQueues, role, createdBy } = operatorData;
  const operator = new OperatorInstance(operatorId, userName, workGroups, workQueues, role, createdBy);
  
  const { createdAt, updatedAt, ...data } = operator;
  return await prisma.operator.create({ data });
};

export const deleteOperator = async (operatorId: string) => {
  try {
    await prisma.operator.delete({
      where: { operatorId }
    });
    return true;
  } catch (error) {
    return false;
  }
};