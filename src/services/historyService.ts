import prisma from "../prisma/client.js";

export const getCaseHistory = async (caseId: string) => {
  const caseHistory = await prisma.history.findMany({
    where: {
      caseId
    }
  })
  return caseHistory;
};

export const createHistory = async (caseId: string, description: string, createdBy: string) => {
  const history = await prisma.history.create({
    data: {
      caseId,
      description,
      createdBy
    }
  })
  return history;
}