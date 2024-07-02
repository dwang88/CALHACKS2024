import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Class, Assignment } from './types';
import './AssignmentSelection.css';
import axios from 'axios';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const AssignmentSelection = () => {
  const { classId } = useParams<{ classId: string }>();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null); // Declare pdfFile in state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string, message: string }>>([]);
  const [outputs, setOutputs] = useState<Array<{ image_name: string, solution_outputs: string[] }>>([]); // State for storing API response outputs

  useEffect(() => {
    const classes: Class[] = [
      {
        id: 1,
        name: 'Math 101',
        assignments: [
          { id: 1, name: 'Homework 1', content: 'Solve integrals', pdfUrl: '/pdfs/ptest.pdf' },
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


  const renderLatex = (text: string) => {
    // Split the text into LaTeX and non-LaTeX parts
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Display math
        return <BlockMath key={index}>{part.slice(2, -2)}</BlockMath>;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        return <InlineMath key={index}>{part.slice(1, -1)}</InlineMath>;
      } else {
        // Regular text
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

    try {
      const response = await axios.post('http://localhost:8000/process', formData);

      // Detailed logging of the response object
      console.log('Full API response:', response);
      const apiOutputs = response.data;

      // Set the outputs state with the response data
      setOutputs(apiOutputs);

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
            {selectedClass.assignments.map((assign: Assignment) => (
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
                {renderLatex(chat.message)}
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

      <div className="solution-output">
        <h2>Solution Output</h2>
        <div>
          {outputs.map((output, index) => (
            <div key={index}>
              <h3>Response for {output.image_name}:</h3>
              {output.solution_outputs.map((text, idx) => (
                <div key={idx}>{renderLatex(text)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentSelection;
