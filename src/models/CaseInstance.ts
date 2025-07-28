import { v4 as uuidv4 } from 'uuid';

export class CaseInstance {
  caseId: string;
  caseTypeId: string;
  label: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
  status: string;
  currentAssignmentId: string | null;
  metadata: Record<string, any>;

  constructor(schema: any, userId: string) {
    if (!schema) throw new Error('Schema not found');
    
    this.caseId = `${schema.rpl}-${uuidv4()}`;
    this.caseTypeId = schema.id;
    this.label = schema.label;
    this.createdBy = userId;
    this.updatedBy = userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.status = "New";
    this.currentAssignmentId = null;
    this.metadata = {};
  }
}