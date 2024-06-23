// src/StudentDashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { Class, Assignment } from './types';

const StudentDashboard = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ sender: string, message: string }>>([]);

    useEffect(() => {
        // Uncomment the following lines to fetch classes from the server
        // axios.get('http://localhost:5000/get_classes')
        //     .then(response => {
        //         setClasses(response.data);
        //     })
        //     .catch(error => {
        //         console.error('Error fetching classes:', error);
        //     });

        // Mock data for classes
        setClasses([
            { id: 1, name: 'Math 101' },
            { id: 2, name: 'History 201' }
        ]);
    }, []);

    const handleClassSelect = (classId: number) => {
        const selected = classes.find(cls => cls.id === classId) || null;
        setSelectedClass(selected);

        // Uncomment the following lines to fetch assignments for the selected class
        // axios.get(`http://localhost:5000/get_assignments?classId=${classId}`)
        //     .then(response => {
        //         setAssignments(response.data);
        //     })
        //     .catch(error => {
        //         console.error('Error fetching assignments:', error);
        //     });

        // Mock data for assignments
        if (classId === 1) {
            setAssignments([
                { id: 1, name: 'Homework 1', url: 'https://example.com/math101_hw1.pdf' },
                { id: 2, name: 'Homework 2', url: 'https://example.com/math101_hw2.pdf' }
            ]);
        } else if (classId === 2) {
            setAssignments([
                { id: 1, name: 'Homework 1', url: 'https://example.com/history201_hw1.pdf' },
                { id: 2, name: 'Homework 2', url: 'https://example.com/history201_hw2.pdf' }
            ]);
        }
    };

    const handleAssignmentSelect = (assignmentUrl: string) => {
        const selected = assignments.find(assign => assign.url === assignmentUrl) || null;
        setSelectedAssignment(selected);
        setPdfUrl(assignmentUrl);
    };

    const handleChatSubmit = () => {
        if (!chatInput) return;

        const newChatHistory = [...chatHistory, { sender: 'student', message: chatInput }];
        setChatHistory(newChatHistory);

        // Uncomment the following lines to send the chat input to the backend
        // axios.post('http://localhost:5000/process_question', { question: chatInput })
        //     .then(response => {
        //         const assistantResponse = response.data.answer;
        //         setChatHistory([...newChatHistory, { sender: 'assistant', message: assistantResponse }]);
        //     })
        //     .catch(error => {
        //         console.error('Error processing question:', error);
        //     });

        // Mock response from chatbot
        setTimeout(() => {
            setChatHistory(prevHistory => [...prevHistory, { sender: 'assistant', message: `Response to: ${chatInput}` }]);
        }, 1000);

        setChatInput('');
    };

    return (
        <div className="student-dashboard">
            <div className="class-selection">
                <h2>Select a Class</h2>
                <ul>
                    {classes.map(cls => (
                        <li key={cls.id} onClick={() => handleClassSelect(cls.id)}>
                            {cls.name}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedClass && (
                <div className="assignment-selection">
                    <h2>Select an Assignment</h2>
                    <ul>
                        {assignments.map(assign => (
                            <li key={assign.id} onClick={() => handleAssignmentSelect(assign.url)}>
                                {assign.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {pdfUrl && (
                <div className="pdf-viewer">
                    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js`}>
                        <Viewer fileUrl={pdfUrl} />
                    </Worker>
                </div>
            )}

            <div className="chatbot">
                <h2>Chatbot</h2>
                <div className="chat-history">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`chat-message ${chat.sender}`}>
                            <span>{chat.message}</span>
                        </div>
                    ))}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a question..."
                    />
                    <button onClick={handleChatSubmit}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
