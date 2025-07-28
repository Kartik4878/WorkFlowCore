export class WorkQueueInstance {
  key: string;
  label: string;
  workGroup: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;

  constructor(
    key: string,
    label: string,
    workGroup: string,
    createdBy: string
  ) {
    this.key = key;
    this.label = label;
    this.workGroup = workGroup;
    this.createdBy = createdBy;
    this.createdAt = new Date();
    this.updatedBy = createdBy;
    this.updatedAt = new Date();
  }
}