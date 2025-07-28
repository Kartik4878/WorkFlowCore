import { FastifyReply, FastifyRequest } from 'fastify';
import { saveAttachment, getAttachmentsByCase, getAttachmentById, deleteAttachment } from '../services/attachmentService.js';


export const uploadAttachmentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await req.file();
    if (!data) return reply.status(400).send({ error: 'No file uploaded' });

    const { caseId } = req.params as any;
    const filename = `${Date.now()}-${data.filename}`;
    const buffer = await data.toBuffer();
    const base64Data = buffer.toString('base64');

    await saveAttachment({
      filename,
      originalName: data.filename,
      mimeType: data.mimetype,
      size: buffer.length,
      base64Data,
      caseId,
      uploadedBy: req.userId as string
    });
    reply.status(201).send({ error: 'Upload successful' });
  } catch (error) {
    console.error('Upload error:', error);
    reply.status(500).send({ error: 'Upload failed' });
  }
};

export const getAttachmentsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { caseId } = req.params as any;
  try {
    const attachments = await getAttachmentsByCase(caseId);
    reply.send(attachments);
  } catch (error) {
    console.error('Get attachments error:', error);
    reply.status(500).send({ error: 'Failed to get attachments' });
  }
};

export const getAttachmentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { attachmentId } = req.params as any;
  try {
    const attachment = await getAttachmentById(attachmentId);
    if (!attachment) {
      return reply.status(404).send({ error: 'Attachment not found' });
    }
    reply.send(attachment);
  } catch (error) {
    console.error('Get attachment error:', error);
    reply.status(500).send({ error: 'Failed to get attachment' });
  }
};

export const deleteAttachmentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { attachmentId } = req.params as any;
  try {
    await deleteAttachment(attachmentId);
    reply.status(204).send();
  } catch (error) {
    console.error('Delete attachment error:', error);
    reply.status(500).send({ error: 'Failed to delete attachment' });
  }
};