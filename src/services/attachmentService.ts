import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const saveAttachment = async (attachmentData: {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  base64Data: string;
  caseId: string;
  uploadedBy: string;
}) => {
  return await prisma.attachment.create({
    data: attachmentData
  });
};

export const getAttachmentsByCase = async (caseId: string) => {
  return await prisma.attachment.findMany({
    where: { caseId },
    select: {
      id: true,
      uploadedAt: true,
      uploadedBy: true,
      caseId: true,
      mimeType: true,
      originalName: true,
      filename: true
    }
  });
};

export const getAttachmentById = async (id: string) => {
  return await prisma.attachment.findUnique({
    where: { id },
    select: {
      id: true,
      base64Data: true,
      originalName: true
    }
  });
};

export const deleteAttachment = async (id: string) => {
  return await prisma.attachment.delete({
    where: { id }
  });
};