import React, { useEffect, useState } from 'react';
import './TeacherDashboard.css';
import { getAuth } from 'firebase/auth';
import StudentDashboard from './StudentDashboard';
import ClassCard from './components/ClassCard';

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

    // const cards = [
    //     { id: 1, title: 'Students Enrolled', content: '32' },
    //     { id: 2, title: 'Most % Help Rate', content: 'Integrals' },
    //     { id: 3, title: 'Classes Taught', content: '3' },
    //     { id: 4, title: 'Average Test Score', content: '87%' },
    //     { id: 5, title: 'Upcoming Assignments', content: 'Physics Quiz' },
    //     { id: 6, title: 'Recent Feedback', content: 'Positive comments from parents' }
    // ];

    const auth = getAuth();
    const [classes,setClasses] = useState<Class[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {

            const uid = auth.currentUser?.uid;

            if(!uid) {
                console.error("No user logged in");
                return;
            }

            const endpoint = `http://localhost:5000/get_classes_of_teacher/${uid}/`;
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                if(!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const data = await response.json();

                setClasses(data.Classes);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }

        fetchClasses();
    }, [])

    return (
      <div>
        <h1 className='teacher'>Teacher Dashboard</h1>
        <div className="dashboard">
            <div className="card-grid">
                {classes.map((specClass) => (
                    <div key={specClass.class_id} className="card">
                        <ClassCard specClass={specClass} />
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
};

export default TeacherDashboard;