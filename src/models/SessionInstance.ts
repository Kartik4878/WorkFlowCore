import { v4 as uuidv4 } from 'uuid';

export class SessionInstance {
  sessionId: string;
  createdAt: Date;
  caseId: string;
  createdBy: string;

  constructor(caseId: string, createdBy: string) {
    this.sessionId = uuidv4();
    this.createdAt = new Date();
    this.createdBy = createdBy;
    this.caseId = caseId;
  }
}