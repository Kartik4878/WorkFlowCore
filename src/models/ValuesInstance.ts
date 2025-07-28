export class ValuesInstance {
    key: string;
    type: string;
    label: string;
    value: string;
    sort: number;
    workGroup: string;
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;

    constructor(
        type: string,
        sort: number,
        label: string,
        value: string,
        workGroup: string,
        createdBy: string
    ) {
        this.key = '';
        this.type = type;
        this.label = label;
        this.value = value;
        this.sort = sort;
        this.workGroup = workGroup;
        this.createdBy = createdBy;
        this.createdAt = new Date();
        this.updatedBy = createdBy;
        this.updatedAt = new Date();
    }
}