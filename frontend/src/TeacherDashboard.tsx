import React, { useEffect, useState } from 'react';
import './TeacherDashboard.css';
import { getAuth } from 'firebase/auth';
import ClassCard from './components/ClassCard';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import { Class } from './types';
import { useAuth } from './contexts/authContext';

const TeacherDashboard: React.FC = () => {
    const auth = getAuth();
    const { userType, currentUser } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    
    const fetchClasses = async () => {
        const uid = currentUser?.uid;
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
        console.log(userType);
        fetchClasses();
    }, []);
    
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
