// src/types.ts
export type Student = {
    student_id: string,
    name: string,
    classes: string[],
    report: string[],
    questions: string[],
    assignments: Assignment[]
}

export type Class = {
    id: number,
    class_id: string,
    name: string,
    students: Student[],
    class_report: string,
    assignments: Assignment[]
}

export type Assignment = {
    _id: string,
    class_id: string,
    title: string,
    description: string,
    completed: boolean,
    started: boolean,
    score: number,
    url: string // file id
}
