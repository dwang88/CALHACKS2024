import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Class } from './types';
import './AssignmentSelection.css';
import axios from 'axios';

const AssignmentSelection = () => {
  const { classId } = useParams<{ classId: string }>();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null); // Declare pdfFile in state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string, message: string }>>([]);

  useEffect(() => {
    const classes: Class[] = [
      {
        id: 1,
        name: 'Math 101',
        assignments: [
          { id: 1, name: 'Homework 1', content: 'Solve integrals', pdfUrl: '/pdfs/math101_hw1.pdf' },
          { id: 2, name: 'Homework 2', content: 'Solve differentials', pdfUrl: '/pdfs/math101_hw2.pdf' }
        ]
      },
      {
        id: 2,
        name: 'History 201',
        assignments: [
          { id: 1, name: 'Homework 1', content: 'Write an essay on WWII', pdfUrl: '/pdfs/history201_hw1.pdf' },
          { id: 2, name: 'Homework 2', content: 'Explain the causes of the Great Depression', pdfUrl: '/pdfs/history201_hw2.pdf' }
        ]
      }
    ];

    const selected = classes.find(cls => cls.id === parseInt(classId || '', 10)) || null;
    setSelectedClass(selected);
  }, [classId]);

  const handleAssignmentSelect = (assignmentUrl: string) => {
    setPdfUrl(assignmentUrl);

    // Fetch the PDF file from the server and set it to pdfFile state
    fetch(assignmentUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], assignmentUrl.split('/').pop() || 'assignment.pdf', { type: blob.type });
        setPdfFile(file);
      });
  };

  const handleChatSubmit = async () => {
    if (!chatInput || !pdfFile) return;

    const newChatHistory = [...chatHistory, { sender: 'student', message: chatInput }];
    setChatHistory(newChatHistory);

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('user_prompt', chatInput);

    try {
      const response = await axios.post('http://localhost:8000/process', formData);
      const assistantResponse = response.data.answer;
      setChatHistory(prevHistory => [...prevHistory, { sender: 'assistant', message: assistantResponse }]);
    } catch (error) {
      console.error('Error processing question:', error);
    }

    setChatInput('');
  };

  return (
    <div className="assignment-selection">
      {selectedClass && (
        <>
          <h2>Select an Assignment for {selectedClass.name}</h2>
          <ul className="assignment-list">
            {selectedClass.assignments.map(assign => (
              <li key={assign.id} onClick={() => handleAssignmentSelect(assign.pdfUrl)}>
                {assign.name}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="viewer-chat-container">
        {pdfUrl && (
          <div className="pdf-viewer">
            <iframe
              src={pdfUrl}
              width="80%"
              height="400px"
              title="PDF Viewer"
            />
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
    </div>
  );
};

export default AssignmentSelection;
