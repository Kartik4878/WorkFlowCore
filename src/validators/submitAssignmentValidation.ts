import { getValuesByType } from '../services/valueServices.js';
import { evaluateCondition } from '../utils/conditionUtils.js';

interface MetadataField {
  key: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  label: string;
  required: boolean;
  values?: { value: string; label: string }[];
}

type AssignmentMetadata = Record<string, MetadataField> | Record<string, any> | any;

interface SubmissionData {
  [key: string]: any;
}

export const validateAssignmentSubmission = async (
  assignmentMetadata: AssignmentMetadata,
  submissionData: SubmissionData
): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  if (!assignmentMetadata || typeof assignmentMetadata !== 'object') {
    return { isValid: true, errors: [] };
  }

  // Check required fields
  Object.entries(assignmentMetadata).forEach(([key, fieldConfig]: [string, any]) => {
    if (fieldConfig.required && (!submissionData.hasOwnProperty(key) || submissionData[key] === null || submissionData[key] === undefined || submissionData[key] === '')) {
      errors.push(`Required field '${key}' is missing or empty`);
    }
  });

  // Validate submitted fields
  for (const [key, value] of Object.entries(submissionData)) {
    const fieldConfig = assignmentMetadata[key];

    if (!fieldConfig) {
      errors.push(`Unknown field '${key}' in submission`);
      continue;
    }

    if (value === null || value === undefined || value === '') continue;

    // Type validation
    switch (fieldConfig.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push(`Field '${key}' must be a number`);
        }
        break;
      case 'date':
        if (isNaN(Date.parse(value))) {
          errors.push(`Field '${key}' must be a valid date`);
        }
        break;
      // case 'select':
      //   if (fieldConfig.values && fieldConfig.values.length > 0) {
      //     const type = fieldConfig.values[0].key;
      //     const dbValues = await getValuesByType(type);
      //     fieldConfig.values = dbValues.map((v: any) => ({ value: v.value, label: v.label }));
      //   }
      //   if (fieldConfig.values && Array.isArray(fieldConfig.values) && !fieldConfig.values.some((v: any) => v && v.value === value)) {
      //     errors.push(`Field '${key}' must be one of: ${fieldConfig.values.map((v: any) => v && v.value).filter(Boolean).join(', ')}`);
      //   }
      //   break;
      case 'checkbox':
        if (typeof value !== 'boolean') {
          errors.push(`Field '${key}' must be a boolean`);
        }
        break;
    }
    if (fieldConfig.validationCondition && !evaluateCondition(fieldConfig.validationCondition, submissionData)) {
      errors.push(`Value entered for field '${fieldConfig.label}' does not meet the validation condition`);
    }
    if (fieldConfig.values && fieldConfig.values.length > 0) {
      const type = fieldConfig.values[0].key;
      const dbValues = await getValuesByType(type);
      fieldConfig.values = dbValues.map((v: any) => ({ value: v.value, label: v.label }));
    }
    if (fieldConfig.values && Array.isArray(fieldConfig.values) && !fieldConfig.values.some((v: any) => v && v.value === value)) {
      errors.push(`Field '${key}' must be one of: ${fieldConfig.values.map((v: any) => v && v.value).filter(Boolean).join(', ')}`);
    }
  }
  return { isValid: errors.length === 0, errors };
};