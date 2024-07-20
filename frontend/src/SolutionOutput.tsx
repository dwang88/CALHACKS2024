import React, { useState } from 'react';

const SolutionOutput: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [outputs, setOutputs] = useState<Array<{ image_name: string, solution_outputs: string[] }>>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPdfFile(event.target.files[0]);
      setOutputs([]);  // Reset outputs when a new file is selected
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        alert(`Failed to upload PDF: ${errorResponse.detail}`);
        return;
      }

      const data = await response.json();
      setOutputs(data);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert("Error uploading PDF. Please try again.");
    }
  };

  return (
    <div>
    </div>
  );
};

export default SolutionOutput;
