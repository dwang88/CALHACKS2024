import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { Assignment } from "../types";
import axios from "axios";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '../AssignmentSelection.css';

const AssignmentPage = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [assignment, setAssignment] = useState<Assignment>();
    const [homeworkFiles ,setHomeworkFiles] = useState<Array<{ _id: string, filename: string }>>([]);

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

    return (
        <div>
            <h2>Assignment Page</h2>
            <p>Assignment Title: {assignment?.title}</p>
            <p>Assignment Description: {assignment?.description}</p>
            <p>Assignment Score: {assignment?.score}</p>
            <h3>Questions:</h3>
            {assignment?.questions.map(question => (
                <div key={question._id}>
                    <p>{question.question}</p>
                    {question.type === "mcq" && (
                        <div>
                            {question.options.map((option, index) => (
                                <div key={index}>
                                    <label>
                                        <input 
                                            type="radio"
                                            name="mcqOption"
                                            value={option}
                                        />
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                    {question.type === "frq" && (
                        <div>
                            <form>
                                <label>Student Response:</label>
                                <input
                                    type="text"
                                    id="response"
                                />
                            </form>
                        </div>
                    )}
                </div>
            ))}
            <div className="homework-section">
                <h2>Today's Homework</h2>
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
    );
}

export default AssignmentPage;