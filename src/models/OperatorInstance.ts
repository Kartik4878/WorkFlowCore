export class OperatorInstance {
  operatorId: string;
  userName: string;
  workGroups: string[];
  workQueues: string[];
  role: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;

  constructor(
    operatorId: string,
    userName: string,
    workGroups: string[],
    workQueues: string[],
    role: string,
    createdBy: string
  ) {
    this.operatorId = operatorId;
    this.userName = userName;
    this.workGroups = workGroups;
    this.workQueues = workQueues;
    this.role = role;
    this.createdBy = createdBy;
    this.createdAt = new Date();
    this.updatedBy = createdBy;
    this.updatedAt = new Date();
  }
}