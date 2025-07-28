export class SchemaInstance {
  id: string;
  schemaData: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;

  constructor(
    id: string,
    schemaData: Record<string, any>,
    createdBy: string
  ) {
    this.id = id;
    this.schemaData = schemaData;
    this.createdBy = createdBy;
    this.createdAt = new Date();
    this.updatedBy = createdBy;
    this.updatedAt = new Date();
  }
}