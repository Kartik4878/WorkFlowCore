
import prisma from '../prisma/client.js';
import { deleteSession } from './sessionService.js';
import { createHistory } from './historyService.js';

export const saveAssignment = async (assignment: any) => {
  return await prisma.assignment.create({
    data: {
      assignmentId: assignment.assignmentId,
      caseId: assignment.caseId,
      processId: assignment.processId,
      assignmentKey: assignment.assignmentKey,
      status: assignment.status,
      assignedTo: assignment.assignedTo,
      assignedToType: assignment.assignedToType,
      metadata: assignment.metadata,
      label: assignment.label || assignment.assignmentKey,
      caseType: assignment.caseType,
      isPreviousActionAllowed: assignment.isPreviousActionAllowed || false,
      isStrict: assignment.isStrict || false
    }
  });
};

export const getAssignmentById = async (id: string) => {
  return await prisma.assignment.findUnique({
    where: { assignmentId: id }
  });
};

export const getAllAssignments = async () => {
  return await prisma.assignment.findMany();
};

export const getWorkQueueAssignments = async (workQueues: string[]) => {
  return await prisma.assignment.findMany({
    where: {
      assignedToType: "WorkQueue",
      assignedTo: {
        in: workQueues
      }
    }
  });
}

export const getMyAssignments = async (userID: string) => {
  return await prisma.assignment.findMany({
    where: {
      assignedTo: userID
    }
  });
}

export const deleteAssignment = async (assignmentId: string) => {
  return await prisma.assignment.delete({
    where: { assignmentId }
  });
};

export const transferAssignment = async (assignmentId: string, operatorId: string, routeToType: string, userId: string) => {
  const assignment = await getAssignmentById(assignmentId);

  if (!assignment) {
    return null;
  }

  // Update assignment details
  const updatedAssignment = await prisma.assignment.update({
    where: { assignmentId },
    data: {
      assignedTo: operatorId,
      assignedToType: routeToType
    }
  });

  // Create history record
  createHistory(assignment.caseId, `Case transferred to ${operatorId} by : ${userId}`, userId);

  // Delete the session
  await deleteSession(assignment.caseId, userId);

  return updatedAssignment;
};


