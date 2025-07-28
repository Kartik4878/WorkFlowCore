import { v4 as uuidv4 } from 'uuid';

export class HistoryInstance {
  historyId: string;
  createdAt: Date;
  caseId: string;
  description: string;
  createdBy:string;

  constructor(caseId: string, description: string, createdBy:string) {
    this.historyId = uuidv4();
    this.createdAt = new Date();
    this.createdBy = createdBy;
    this.caseId = caseId;
    this.description = description;
  }
}