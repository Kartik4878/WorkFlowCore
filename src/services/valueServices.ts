import prisma from '../prisma/client.js';
import { ValuesInstance } from '../models/ValuesInstance.js';

export const createValue = async (valueData: any) => {
  const { type, label, value, sort, workGroup, createdBy } = valueData;
  const valueInstance = new ValuesInstance(type, sort, label, value, workGroup, createdBy);

  const { key, createdAt, updatedAt, ...data } = valueInstance;
  return await prisma.values.create({ data });
};

export const updateValue = async (key: string, valueData: any) => {
  return await prisma.values.update({
    where: { key },
    data: {
      type: valueData.type,
      label: valueData.label,
      value: valueData.value,
      sort: valueData.sort,
      workGroup: valueData.workGroup,
      updatedBy: valueData.updatedBy
    }
  });
};

export const deleteValue = async (key: string) => {
  try {
    await prisma.values.delete({ where: { key } });
    return true;
  } catch (error) {
    return false;
  }
};

export const getValuesByType = async (type: string) => {
  return await prisma.values.findMany({
    where: { type },
    orderBy: { sort: 'asc' }
  });
};

export const getValuesByWorkGroup = async (workGroup: string | string[]) => {
  const whereClause = Array.isArray(workGroup)
    ? { workGroup: { in: workGroup } }
    : { workGroup };

  return await prisma.values.findMany({
    where: whereClause,
    orderBy: { sort: 'asc' }
  });
};

export const getValuesByTypeAndWorkGroup = async (type: string, workGroup: string | string[]) => {
  const whereClause = {
    type,
    workGroup: Array.isArray(workGroup) ? { in: workGroup } : workGroup
  };

  return await prisma.values.findMany({
    where: whereClause,
    orderBy: { sort: 'asc' }
  });
};

export const getAllValues = async () => {
  return await prisma.values.findMany({
    orderBy: { sort: 'asc' }
  });
};