import React, { useEffect, useState } from 'react';
import './TeacherDashboard.css';
import { getAuth } from 'firebase/auth';
import ClassCard from './components/ClassCard';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import { Class } from './types';

const TeacherDashboard: React.FC = () => {
    const auth = getAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [studentIdToAdd, setStudentIdToAdd] = useState('');
    

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
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
