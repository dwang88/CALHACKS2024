import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Assignment, Question } from "../types";
import axios from "axios";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import './AssignmentPage.css';

const AssignmentPage = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignment, setAssignment] = useState<Assignment>();
    const [homeworkFiles, setHomeworkFiles] = useState<Array<{ _id: string, filename: string }>>([]);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
    const [answerChecks, setAnswerChecks] = useState<{[key: string]: boolean}>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId])


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
            fetchHomeworkFiles();
        } catch (error) {
            console.error(error);
        }
    }

    const fetchHomeworkFiles = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:5000/get_homework_files/${assignmentId}/`);
          setHomeworkFiles(response.data.homework_files);
        } catch (error) {
          console.error('Error fetching homework files:', error);
        }
      };

      useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current && sliderRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
                setSliderPosition(Math.min(Math.max(newPosition, 10), 90));
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        const handleMouseDown = () => {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        if (sliderRef.current) {
            sliderRef.current.addEventListener('mousedown', handleMouseDown);
        }

        return () => {
            if (sliderRef.current) {
                sliderRef.current.removeEventListener('mousedown', handleMouseDown);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleAnswerChange = (questionId: string, answer: string) => {
        setUserAnswers(prev => ({...prev, [questionId]: answer}));
    };

    const checkAnswer = (question: Question) => {
        const userAnswer = userAnswers[question._id];
        const isCorrect = userAnswer === question.correctAnswer;
        setAnswerChecks(prev => ({...prev, [question._id]: isCorrect}));
    };
    

    return (
        <div className="assignment-page">
            <h2 className="assignment-title">Assignment: {assignment?.title}</h2>
            <p className="assignment-description">{assignment?.description}</p>
            <p className="assignment-score">Score: {assignment?.score}</p>
    
            <div className="content-container" ref={containerRef}>
                <div className="questions-homework-container">
                    <div 
                        className="homework-section"
                        style={{ width: `${sliderPosition}%` }}
                    >
                        <div className="homework-content">
                            {homeworkFiles.length > 0 ? (
                                homeworkFiles.map(file => (
                                    <div key={file._id} className="pdf-preview">
                                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                                            <Viewer fileUrl={`http://127.0.0.1:5000/get_file/${file._id}`} />
                                        </Worker>
                                    </div>
                                ))
                            ) : (
                                <p>No homework assigned</p>
                            )}
                        </div>
                    </div>
    
                    <div className="slider" ref={sliderRef} style={{ left: `${sliderPosition}%` }}></div>
    
                    <div 
                        className="questions-section"
                        style={{ width: `${100 - sliderPosition}%` }}
                    >
                        <div className="questions-content">
                            <h3>Questions:</h3>
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
                                            />
                                        </div>
                                    )}
                                    <button onClick={() => checkAnswer(question)}>Check Answer</button>
                                    {answerChecks[question._id] !== undefined && (
                                        <p>{answerChecks[question._id] ? "Correct!" : "Incorrect. Try again."}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssignmentPage;