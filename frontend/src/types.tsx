// src/types.ts
export type Student = {
    student_id: string,
    name: string,
    classes: string[],
    report: string[],
    questions: string[]
}

export type Class = {
    class_id: string,
    name: string,
    students: Student[],
    class_report: string,
    assignments: Assignment[]
}

export interface Assignment {
    id: number;
    name: string;
    url: string;
}
