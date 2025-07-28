import prisma from '../prisma/client.js';
import { SessionInstance } from '../models/SessionInstance.js';

/**
 * Creates a new session record and saves it to the database
 * @param caseId The ID of the case
 * @param createdBy Who created the session
 * @returns The created session instance
 */
export const createSession = async (caseId: string, createdBy: string) => {
  // Check if a session already exists for this user and case
  const existingSession = await prisma.session.findFirst({
    where: {
      caseId: caseId,
      createdBy: createdBy
    }
  });

  // If a session already exists, return the existing session
  if (existingSession) {
    return existingSession;
  }

  // Otherwise, create a new session
  const sessionInstance = new SessionInstance(caseId, createdBy);
  return await prisma.session.create({
    data: {
      sessionId: sessionInstance.sessionId,
      caseId: sessionInstance.caseId,
      createdBy: sessionInstance.createdBy
    }
  });
};

/**
 * Gets all session records for a specific case
 * @param caseId The ID of the case
 * @returns Array of session instances for the specified case
 */
export const getCaseSessions = async (caseId: string) => {
  return await prisma.session.findMany({
    where: {
      caseId: caseId
    }
  });
};

/**
 * Gets all session records created by a specific user
 * @param userId The ID of the user
 * @returns Array of session instances created by the specified user
 */
export const getUserSessions = async (userId: string) => {
  return await prisma.session.findMany({
    where: {
      createdBy: userId
    }
  });
};

/**
 * Deletes a session for a specific case and user
 * @param caseId The ID of the case
 * @param userId The ID of the user
 * @returns Boolean indicating whether the deletion was successful
 */
export const deleteSession = async (caseId: string, userId: string): Promise<boolean> => {
  const result = await prisma.session.deleteMany({
    where: {
      caseId: caseId,
      createdBy: userId
    }
  });

  return result.count > 0;
};