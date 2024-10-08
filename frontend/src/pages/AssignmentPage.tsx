import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Assignment, Question } from "../types";
import axios from "axios";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import './AssignmentPage.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import LoadingDots from '../components/LoadingDots'; // Import the LoadingDots component

const AssignmentPage = () => {
    const { studentId, assignmentId } = useParams<{ studentId: string, assignmentId: string }>();
    const [assignment, setAssignment] = useState<Assignment>();
    const [homeworkFiles, setHomeworkFiles] = useState<Array<{ _id: string, filename: string }>>([]);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
    const [answerChecks, setAnswerChecks] = useState<{[key: string]: boolean}>({});
    const [isLoading, setIsLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [horizontalSliderPosition, setHorizontalSliderPosition] = useState(70);
    const horizontalSliderRef = useRef<HTMLDivElement>(null);

    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ sender: string, message: string }>>([]);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [processingResults, setProcessingResults] = useState<Array<{ image_name: string, solution_outputs: string[] }>>([]);

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    const fetchAssignment = async () => {
        try {
            const response = await fetch(`http://localhost:5000/get_assignment/${assignmentId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAssignment(data.Assignment);
            setScore(data.Assignment.score);  
            fetchHomeworkFiles();
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHomeworkFiles = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/get_homework_files/${assignmentId}/`);
            setHomeworkFiles(response.data.homework_files);
            if (response.data.homework_files.length > 0) {
                // Fetch the first homework file and set it as pdfFile
                const fileResponse = await axios.get(`http://127.0.0.1:5000/get_file/${response.data.homework_files[0]._id}`, { responseType: 'blob' });
                const file = new File([fileResponse.data], response.data.homework_files[0].filename, { type: 'application/pdf' });
                setPdfFile(file);
            }
        } catch (error) {
            console.error('Error fetching homework files:', error);
        }
    };

    useEffect(() => {
        const handleVerticalMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
                setSliderPosition(Math.min(Math.max(newPosition, 10), 90));
            }
        };

        const handleHorizontalMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const newPosition = ((e.clientY - containerRect.top) / containerRect.height) * 100;
                setHorizontalSliderPosition(Math.min(Math.max(newPosition, 10), 90));
            }
        };
    
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleVerticalMouseMove);
            document.removeEventListener('mousemove', handleHorizontalMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    
        const handleVerticalMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            document.addEventListener('mousemove', handleVerticalMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleHorizontalMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            document.addEventListener('mousemove', handleHorizontalMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };
    
        if (sliderRef.current) {
            sliderRef.current.addEventListener('mousedown', handleVerticalMouseDown);
        }

        if (horizontalSliderRef.current) {
            horizontalSliderRef.current.addEventListener('mousedown', handleHorizontalMouseDown);
        }
    
        return () => {
            if (sliderRef.current) {
                sliderRef.current.removeEventListener('mousedown', handleVerticalMouseDown);
            }
            if (horizontalSliderRef.current) {
                horizontalSliderRef.current.removeEventListener('mousedown', handleHorizontalMouseDown);
            }
            document.removeEventListener('mousemove', handleVerticalMouseMove);
            document.removeEventListener('mousemove', handleHorizontalMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleAnswerChange = (questionId: string, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionId]: answer}));
        
        const question = assignment?.questions.find(q => q._id === questionId);
        if (question && question.type === "mcq") {
            checkAnswer(question, answer);
        }
    };

    const checkAnswer = async (question: Question, answer?: string) => {
        const userAnswer = answer || userAnswers[question._id];
        const isCorrect = userAnswer === question.correctAnswer;
        const newAnswerChecks = {...answerChecks, [question._id]: isCorrect};
        setAnswerChecks(newAnswerChecks);
    
        const totalQuestions = assignment?.questions.length || 0;
        const correctAnswers = Object.values(newAnswerChecks).filter(Boolean).length;
        const newScore = (correctAnswers / totalQuestions) * 100;
        
        setScore(newScore);
        
        // try {
        //     await axios.put(`http://localhost:5000/update_assignment_score/${assignmentId}/`, {
        //         score: newScore
        //     });
        // } catch (error) {
        //     console.error('Error updating score:', error);
        // }
    };

    const renderLatex = (text: string) => {
        const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
        return parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                return <BlockMath key={index}>{part.slice(2, -2)}</BlockMath>;
            } else if (part.startsWith('$') && part.endsWith('$')) {
                return <InlineMath key={index}>{part.slice(1, -1)}</InlineMath>;
            } else {
                return <span key={index}>{part}</span>;
            }
        });
    };

    const handleChatSubmit = async () => {
        if (!chatInput || !pdfFile) return;
    
        const newChatHistory = [...chatHistory, { sender: 'student', message: chatInput }];
        setChatHistory(newChatHistory);
    
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        formData.append('student_question', chatInput);

        setIsLoading(true); // Set loading to true before API call
    
        try {
            const response = await axios.post('http://localhost:8000/process', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Full API response:', response);
            const results = response.data;
            setProcessingResults(results);
            
            // Add bot response to chat history
            const botMessage = results.map((result: any) => 
                `For ${result.image_name}:\n${result.solution_outputs.join('\n')}`
            ).join('\n\n');
            setChatHistory(prev => [...prev, { sender: 'bot', message: botMessage }]);
    
        } catch (error) {
            console.error('Error processing question:', error);
            setChatHistory(prev => [...prev, { sender: 'bot', message: 'An error occurred while processing your question.' }]);
        } finally {
            setIsLoading(false); 
        }
    
        setChatInput('');
    };

    const submitAssignment = async () => {
        const response = await fetch('http://localhost:5000/add_student_response/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                assignment_id: assignmentId,
                student_id: studentId,
                answers: userAnswers,
                checks: answerChecks,
                score: score,
                completed: true
            })
        })
        if(!response.ok) {
            throw new Error("Network error" + response.statusText);
        }
        setSubmitted(true);
    }

    return (
        <div className="assignment-page">
            <div className="content-container" ref={containerRef}>
                <div className="questions-homework-container">
                    <div className="homework-section" style={{ width: `${sliderPosition}%` }}>
                        <div className="assignment-header">
                            <h2 className="assignment-title">{assignment?.title}</h2>
                            <p className="assignment-description">{assignment?.description}</p>
                        </div>
                        <div>
                            {homeworkFiles.length > 0 ? (
                                homeworkFiles.map(file => (
                                    <div key={file._id} className="pdf-preview2">
                                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                                            <Viewer fileUrl={`http://127.0.0.1:5000/get_file/${file._id}`} />
                                        </Worker>
                                    </div>
                                ))
                            ) : (
                                <p>No homework documents</p>
                            )}
                        </div>
                    </div>
                    {!submitted ? (
                        <>  
                            <div className="slider" ref={sliderRef} style={{ left: `${sliderPosition}%` }}></div>
                            <div 
                                className="questions-section"
                                style={{ width: `${100 - sliderPosition}%` }}
                            >
                                <div className="questions-content">
                                    <div className="questions-area" style={{ height: `${horizontalSliderPosition}%` }}>
                                        <div className="questions-header">
                                            <h3 className="questions-title">Questions:</h3>
                                            <p className="assignment-score">Score: {score.toFixed(2)}%</p>
                                        </div>
                                        {assignment?.questions.map(question => (
                                            <div key={question._id} className="question">
                                                <p>{question.question}</p>
                                                {question.type === "mcq" && (
                                                    <div className="mcq-options">
                                                        {question.options.map((option, index) => (
                                                            <div key={index} className="mcq-option">
                                                                <label>
                                                                    <input
                                                                        type="radio"
                                                                        name={`mcqOption-${question._id}`}
                                                                        value={option}
                                                                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                                                        disabled={answerChecks[question._id] !== undefined}
                                                                    />
                                                                    {option}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {question.type === "frq" && (
                                                    <div className="frq-response">
                                                        <input 
                                                            type="text" 
                                                            id={`response-${question._id}`} 
                                                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                                            disabled={answerChecks[question._id] !== undefined}
                                                        />
                                                        <i 
                                                            className="check-answer-icon fa-solid fa-arrow-right" 
                                                            onClick={() => checkAnswer(question)}
                                                            title="Check Answer"
                                                        ></i>
                                                    </div>
                                                )}
                                                {answerChecks[question._id] !== undefined && (
                                                    <p className={answerChecks[question._id] ? "correct-answer" : "incorrect-answer"}>
                                                        {answerChecks[question._id] ? "Correct" : "Incorrect"}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div 
                                        className="horizontal-slider" 
                                        ref={horizontalSliderRef}
                                        style={{ top: `${horizontalSliderPosition}%` }}
                                    ></div>
                                    <div className="chatbot" style={{ height: `${100 - horizontalSliderPosition}%` }}>
                                        <div className="chat-history">
                                            {chatHistory.map((chat, index) => (
                                                <div key={index} className={`chat-message ${chat.sender}`}>
                                                    {renderLatex(chat.message)}
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="chat-message bot">
                                                    <LoadingDots />
                                                </div>
                                            )}
                                        </div>
                                        <div className="chat-input">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Ask a question..."
                                                disabled={isLoading}
                                            />
                                            <button onClick={handleChatSubmit} disabled={isLoading}>
                                                {isLoading ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={submitAssignment}>Submit Assignment</button>
                            </div>
                        </>
                    ) : (
                        <h1>Submitted!</h1>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AssignmentPage;