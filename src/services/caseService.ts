import prisma from "../prisma/client.js";

import { deleteSession } from './sessionService.js';
export const saveCase = async (caseObj: any) => {
  return await prisma.case.update({
    where: { caseId: caseObj.caseId },
    data: {
      label: caseObj.label,
      updatedBy: caseObj.updatedBy,
      status: caseObj.status,
      currentAssignmentId: caseObj.currentAssignmentId,
      metadata: caseObj.metadata
    }
  })
};

export const getCases = async () => {
  return await prisma.case.findMany();
};

export const getCaseTypeIDs = async (): Promise<string[]> => {
  try {
    const schemas = await prisma.schema.findMany({ select: { id: true } });
    return schemas.map(schema => schema.id);
  } catch (error) {
    console.error('Error getting case type IDs:', error);
    return [];
  }
};

export const closeCase = async (caseId: string, userId: string): Promise<boolean> => {
  try {
    return await deleteSession(caseId, userId);
  } catch (error) {
    console.error('Error closing case:', error);
    return false;
  }
};

export const updateCaseSchema = async (schemaId: string, schemaData: any, updatedBy: string): Promise<boolean> => {
  try {
    await prisma.schema.update({
      where: { id: schemaId },
      data: {
        schemaData: schemaData,
        updatedBy: updatedBy
      }
    });
    return true;
  } catch (error) {
    console.error('Error updating case schema:', error);
    return false;
  }
};

export const createCaseSchema = async (schemaId: string, schemaData: any, createdBy: string): Promise<boolean> => {
  try {
    await prisma.schema.create({
      data: {
        id: schemaId,
        schemaData: schemaData,
        createdBy: createdBy,
        updatedBy: createdBy
      }
    });
    return true;
  } catch (error) {
    console.error('Error creating case schema:', error);
    return false;
  }
};


export const createCase = async (caseObj: any) => {
  const { caseId, caseTypeId, label, createdBy, updatedBy, status, currentAssignmentId, metadata } = caseObj;
  const newCase = await prisma.case.create({
    data: {
      caseId,
      caseTypeId,
      label,
      createdBy,
      updatedBy,
      status,
      currentAssignmentId,
      metadata
    }
  });
  return newCase;
};

export const getCaseById = async (id: string) => {
  const caseDetails = await prisma.case.findUnique({
    where: {
      caseId: id
    }
  });
  return caseDetails;
};

export const getCaseTypeSchema = async (id: string) => {
  try {
    const schema = await prisma.schema.findUnique({
      where: { id: id }
    });
    return schema?.schemaData || null;
  } catch (error) {
    console.error('Error getting case type schema:', error);
    return null;
  }
};