import React, { useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import '../TeacherDashboard.css';
import CreateQuestion from './CreateQuestionComponent';
import { Question } from '../types';
import './CreateAssignment.css';


interface AssignmentFormProps {
    classId: string | undefined;
}

const CreateAssignmentForm: React.FC<AssignmentFormProps> = ({ classId }) => {
  const [assignmentTitle, setAssignmentTitle] = useState<string>('');
  const [assignmentDescription, setAssignmentDescription] = useState<string>('');
  const [assignmentId, setAssignmentId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssignmentTitle(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssignmentDescription(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const assignmentData = {
        class_id: classId,
        title: assignmentTitle,
        description: assignmentDescription,
        completed: false,
        started: false,
        score: 0,
        url: "",
        questions: questions
    }
    try {
        const response = await fetch('http://localhost:5000/create_assignment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assignmentData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json()
        const assignment_id = data.assignment_id;
        setAssignmentId(assignment_id);
        handleUploadHomework(assignment_id);
        console.log('Data', data);
    } catch (error) {
        console.error(error);
    }
    // You can now send this data to your backend or handle it as needed
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        setSelectedFile(event.target.files[0]);
        const fileUrl = URL.createObjectURL(event.target.files[0]);
        setPdfUrl(fileUrl);
    }
};

const handleUploadHomework = async (assignmentId: string) => {
    if (!selectedFile) {
        alert('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const response = await fetch(`http://127.0.0.1:5000/upload_homework/${assignmentId}/`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload homework');
        }

        const result = await response.json();
        alert(result.message);
        setSelectedFile(null);
        setPdfUrl(null);
    } catch (error) {
        console.error('Error uploading homework:', error);
        alert('Failed to upload homework. Please try again.');
    }
};

const handleAddQuestion = (newQuestion: Question) => {
  setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
}

  return (
    <div className="create-assignment-form">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="assignmentTitle">Assignment Title:</label>
          <input
            type="text"
            id="assignmentTitle"
            value={assignmentTitle}
            onChange={handleTitleChange}
          />
        </div>
        <div>
          <label htmlFor="assignmentDescription">Assignment Description:</label>
          <input
            type="text"
            id="assignmentDescription"
            value={assignmentDescription}
            onChange={handleDescriptionChange}
          />
        </div>
        <div className="upload-homework-form">
          <label htmlFor="fileUpload">Upload Homework:</label>
          <input
            id="fileUpload"
            type="file"
            onChange={handleFileChange}
          />
        </div>
        <CreateQuestion onAddQuestion={handleAddQuestion}/>
        <button type="submit">Create Assignment</button>
        {pdfUrl && (
          <div className="pdf-preview">
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateAssignmentForm;
