interface Property {
  key: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  label: string;
  required: boolean;
  validationCondition: string;
  values: { value: string; label: string }[];
}

interface AssignmentConfig {
  label: string;
  routeTo: string;
  condition: string;
  properties: Property[];
  routeToType: 'Operator' | 'WorkQueue';
  isPreviousActionAllowed: boolean;
  isStrict: boolean;
}

interface Process {
  status: string;
  condition: string;
  assignments: string[];
  assignmentConfigs: Record<string, AssignmentConfig>;
  completionStatus?: string;
}

interface WorkflowSchema {
  id: string;
  rpl: string;
  label: string;
  processes: Record<string, Process>;
}

import { getOperators, getWorkqueues } from '../services/operatorServices.js';

export const validateWorkflowSchema = async (schema: any): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // Basic required fields
  if (!schema.id) errors.push('Schema must have an id');
  if (!schema.rpl) errors.push('Schema must have an rpl');
  if (!schema.label) errors.push('Schema must have a label');
  if (!schema.processes) errors.push('Schema must have processes');


  // Get operators and workqueues once for all validations
  const operators = await getOperators();
  const operatorIds = operators.map(op => op.operatorId);
  const workQueues = await getWorkqueues();
  const workQueueKeys = workQueues.map(wq => wq.key);

  // Validate processes
  if (schema.processes) {
    Object.entries(schema.processes).forEach(([processKey, process]: [string, any]) => {
      if (!process.status) errors.push(`Process ${processKey} must have a status`);
      if (!Array.isArray(process.assignments)) errors.push(`Process ${processKey} must have assignments array`);
      if (!process.assignmentConfigs) errors.push(`Process ${processKey} must have assignmentConfigs`);

      // Validate assignments match assignmentConfigs
      if (process.assignments && process.assignmentConfigs) {
        process.assignments.forEach((assignmentId: string) => {
          if (!process.assignmentConfigs[assignmentId]) {
            errors.push(`Assignment ${assignmentId} in process ${processKey} has no config`);
          }
        });
      }

      // Validate assignment configs
      if (process.assignmentConfigs) {
        Object.entries(process.assignmentConfigs).forEach(([assignmentId, config]: [string, any]) => {
          if (!config.label) errors.push(`Assignment ${assignmentId} must have a label`);
          if (!config.routeTo) errors.push(`Assignment ${assignmentId} must have routeTo`);
          if (!config.routeToType) errors.push(`Assignment ${assignmentId} must have routeToType`);
          if (!['Operator', 'WorkQueue'].includes(config.routeToType)) {
            errors.push(`Assignment ${assignmentId} routeToType must be 'Operator' or 'WorkQueue'`);
          }

          // Validate routeTo for Operator type
          if (config.routeToType === 'Operator') {
            if (config.routeTo !== 'current' && !operatorIds.includes(config.routeTo)) {
              errors.push(`Assignment ${assignmentId} routeTo must be 'current' or valid operatorId`);
            }
          }

          // Validate routeTo for WorkQueue type
          if (config.routeToType === 'WorkQueue') {
            if (!workQueueKeys.includes(config.routeTo)) {
              errors.push(`Assignment ${assignmentId} routeTo must be valid workQueue key`);
            }
          }
          if (typeof config.isPreviousActionAllowed !== 'boolean') {
            errors.push(`Assignment ${assignmentId} isPreviousActionAllowed must be boolean`);
          }
          if (typeof config.isStrict !== 'boolean') {
            errors.push(`Assignment ${assignmentId} isStrict must be boolean`);
          }

          // Validate properties
          if (!Array.isArray(config.properties)) {
            errors.push(`Assignment ${assignmentId} must have properties array`);
          } else {
            config.properties.forEach((prop: any, index: number) => {
              if (!prop.key) errors.push(`Property ${index} in assignment ${assignmentId} must have key`);
              if (!prop.type) errors.push(`Property ${index} in assignment ${assignmentId} must have type`);
              if (!['text', 'number', 'select', 'date', 'checkbox'].includes(prop.type)) {
                errors.push(`Property ${index} in assignment ${assignmentId} type must be 'text', 'number', 'select', 'date', or 'checkbox'`);
              }
              if (!prop.label) errors.push(`Property ${index} in assignment ${assignmentId} must have label`);
              if (typeof prop.required !== 'boolean') {
                errors.push(`Property ${index} in assignment ${assignmentId} required must be boolean`);
              }
            });
          }
        });
      }
    });
  }

  return { isValid: errors.length === 0, errors };
};