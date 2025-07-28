import { v4 as uuidv4 } from 'uuid';

interface PropertyDefinition {
  key: string;
}

export class AssignmentInstance {
  assignmentId: string;
  caseId: string;
  processId: string;
  assignmentKey: string;
  createdAt: Date;
  status: string;
  assignedTo: string;
  assignedToType: string;
  metadata: Record<string, any>;
  label: string;
  caseType: string;
  isPreviousActionAllowed: boolean;
  isStrict: boolean;



  constructor(caseId: string, processId: string, assignmentKey: string, schema: any, assignedTo?: string, assignedToType?: string) {
    this.assignmentId = `${assignmentKey}-${uuidv4()}`;
    this.caseId = caseId;
    this.processId = processId;
    this.assignmentKey = assignmentKey;
    this.createdAt = new Date();
    this.caseType = schema.id;
    this.status = schema.processes?.[processId]?.status;
    this.metadata = {};

    const assignmentConfigs = schema.processes?.[processId]?.assignmentConfigs?.[assignmentKey];
    this.label = assignmentConfigs.label;
    this.isStrict = assignmentConfigs.isStrict;
    this.isPreviousActionAllowed = assignmentConfigs.isPreviousActionAllowed;
    if (assignmentConfigs.routeTo === "current") {
      this.assignedToType = "Operator";
      this.assignedTo = assignedTo || "";
    } else if (assignedTo && assignedToType) {
      this.assignedToType = assignedToType;
      this.assignedTo = assignedTo;
    } else if (assignmentConfigs.routeToType) {
      this.assignedToType = assignmentConfigs.routeToType;
      this.assignedTo = assignmentConfigs.routeToType === "WorkQueue"
        ? assignmentConfigs.routeTo || "Default"
        : assignmentConfigs.routeToType === "Operator"
          ? assignedTo || ""
          : assignmentConfigs.routeTo || "";
    } else {
      this.assignedToType = "WorkQueue";
      this.assignedTo = "Default";
    }

    const props = assignmentConfigs?.properties || [];
    props.forEach((prop: PropertyDefinition) => {
      this.metadata[prop.key] = prop;
    });
  }
}