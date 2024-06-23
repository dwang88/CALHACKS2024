// src/types.ts
export interface Assignment {
    id: number;
    name: string;
    content: string;
    pdfUrl: string;
}


export interface Class {
    id: number;
    name: string;
    assignments: Assignment[];
}
