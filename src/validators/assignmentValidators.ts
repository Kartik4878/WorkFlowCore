import { getOperatorById } from '../services/operatorServices.js';
import { getCaseSessions } from '../services/sessionService.js';

/**
 * Checks the status of an assignment to determine if a user can access it
 * @param assignment The assignment to check
 * @param userId The ID of the user trying to access the assignment
 * @returns An object with status information
 */
export const getAssignmentStatus = async (assignment: any, userId: string): Promise<{
  canAccess: boolean;
  errorCode?: number;
  errorMessage?: string;
}> => {
  const createError = (message: string) => ({ canAccess: false, errorCode: 402, errorMessage: message });

  if (assignment.assignedToType === "Operator" && assignment.assignedTo && assignment.assignedTo !== userId) {
    return createError(`Assignment is currently Assigned to ${assignment.assignedTo}`);
  }

  if (assignment.assignedToType === "WorkQueue") {
    const operator: any = await getOperatorById(userId);
    if (!operator?.workQueues?.includes(assignment.assignedTo)) {
      return createError(`Assignment is currently Assigned to ${assignment.assignedTo}`);
    }
  }

  const sessions = await getCaseSessions(assignment.caseId);
  if (sessions.length > 0 && sessions[0].createdBy !== userId) {
    return createError(`Case is currently worked on by ${sessions[0].createdBy}`);
  }

  return { canAccess: true };
};