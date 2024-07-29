import React, { useEffect, useState } from 'react';
import './TeacherDashboard.css';
import { getAuth } from 'firebase/auth';
import ClassCard from './components/ClassCard';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';

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
    class_report: string
}

const TeacherDashboard: React.FC = () => {
    const auth = getAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [studentIdToAdd, setStudentIdToAdd] = useState('');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const fetchClasses = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            console.error("No user logged in");
            return;
        }
        const endpoint = `http://127.0.0.1:5000/get_classes_of_teacher/${uid}/`;
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            setClasses(data.Classes);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleAddStudent = async (classId: string) => {
        if (!studentIdToAdd) {
            alert('Please enter a student ID');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:5000/enroll_student/${classId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_id: studentIdToAdd }),
            });

            if (!response.ok) {
                throw new Error('Failed to add student');
            }

            const result = await response.json();
            alert(result.message);
            setStudentIdToAdd('');
            // Refresh the class list
            fetchClasses();
        } catch (error) {
            console.error('Error adding student:', error);
            alert('Failed to add student. Please try again.');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            const fileUrl = URL.createObjectURL(event.target.files[0]);
            setPdfUrl(fileUrl);
        }
    };

    const handleUploadHomework = async (classId: string) => {
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`http://127.0.0.1:5000/upload_homework/${classId}/`, {
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

    return (
        <div>
            <h1 className='teacher'>Teacher Dashboard</h1>
            <div className="dashboard">
                {classes.length === 0 ? (
                    <div className="no-classes">
                        <h2>No classes found</h2>
                    </div>
                ) : (
                    <div className="card-grid">
                        {classes.map((specClass) => (
                            <div key={specClass.class_id} className="card">
                                <ClassCard specClass={specClass} />
                                <div className="add-student-form">
                                    <input
                                        type="text"
                                        value={studentIdToAdd}
                                        onChange={(e) => setStudentIdToAdd(e.target.value)}
                                        placeholder="Enter Student ID"
                                    />
                                    <button onClick={() => handleAddStudent(specClass.class_id)}>
                                        Add Student
                                    </button>
                                </div>
                                <div className="upload-homework-form">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                    <button onClick={() => handleUploadHomework(specClass.class_id)}>
                                        Upload Homework
                                    </button>
                                </div>
                                {pdfUrl && (
                                    <div className="pdf-preview">
                                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                                            <Viewer fileUrl={pdfUrl} />
                                        </Worker>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
