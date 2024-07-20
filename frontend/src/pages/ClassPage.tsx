import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Class, Student } from "../TeacherDashboard";
import "./ClassPage.css";

const ClassPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const [specClass, setSpecClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [report, setReport] = useState<string | undefined>("");

  useEffect(() => {
    const fetchStudent = async (studentId: string): Promise<Student | undefined> => {
      try {
        const response = await fetch(`http://localhost:5000/get_student/${studentId}/`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        return data.Student;
      } catch (error) {
        console.error(error);
      }
    };

    const fetchClass = async () => {
      try {
        const response = await fetch(`http://localhost:5000/get_class/${classId}/`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();
        const studentIds = data.Class.students;

        const fetchedStudents = await Promise.all(studentIds.map((id: string) => fetchStudent(id)));
        const filteredStudents = fetchedStudents.filter((student) => student != null) as Student[];
        setStudents(filteredStudents);
        setSpecClass({
          ...data.Class,
          students: filteredStudents
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchClass();
  }, [classId]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudent(event.target.value);
  };

  const generateStudentReport = async (studentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/generate_student_report/${studentId}/`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      setReport(data.Report);
    } catch (error) {
      console.error(error);
    }
  };

  if (!specClass) {
    return <p>Loading...</p>;
  }

  return (
    <div className="class-page">
      <p className="class-name">Class Name: {specClass.name}</p>
      <select value={selectedStudent} onChange={handleSelectChange} className="student-select">
        <option value="">Select a student</option>
        {students?.map((student) => (
          <option key={student.student_id} value={student.student_id}>
            {student.name}
          </option>
        ))}
      </select>
      <button onClick={() => generateStudentReport(selectedStudent)} className="generate-report-button">
        Generate Report
      </button>
      <p className="report">Report: {report}</p>
    </div>
  );
};

export default ClassPage;
