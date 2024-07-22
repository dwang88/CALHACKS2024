import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Class, Student } from "../TeacherDashboard";
import "./ClassPage.css";

const ClassPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const [specClass, setSpecClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[] | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [report, setReport] = useState<string | undefined>("");
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

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

  useEffect(() => {
    if (students) {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [students, searchTerm]);

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

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowPopup(true);
    setReport(undefined);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedStudent(null);
    setReport(undefined);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const toggleReports = () => setShowAllReports(!showAllReports);
  const toggleQuestions = () => setShowAllQuestions(!showAllQuestions);


  if (!specClass) {
    return <p>Loading...</p>;
  }

  return (
    <div className="class-page">
      <h1 className="class-name">{specClass.name}</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="students-list">
        {filteredStudents?.map((student) => (
          <div key={student.student_id} className="student-row" onClick={() => handleStudentClick(student)}>
            <div className="student-name">{student.name}</div>
            <div className="student-info">
              <div>Student ID: {student.student_id}</div>
            </div>
          </div>
        ))}
      </div>
      {showPopup && selectedStudent && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{selectedStudent.name}</h2>
            <p>Student ID: {selectedStudent.student_id}</p>
            <div className="past-reports">
              <h3>Past Reports</h3>
              {selectedStudent.report && selectedStudent.report.length > 0 ? (
                <>
                  <p>{selectedStudent.report[selectedStudent.report.length - 1]}</p>
                  {selectedStudent.report.length > 1 && (
                    <button onClick={toggleReports} className="view-more-button">
                      {showAllReports ? "Hide" : "View More"}
                    </button>
                  )}
                  {showAllReports && (
                    <ul>
                      {selectedStudent.report.slice(0, -1).reverse().map((r, index) => (
                        <li key={index}>{r}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p>No past reports available.</p>
              )}
            </div>
            <div className="past-questions">
              <h3>Past Questions</h3>
              {selectedStudent.questions && selectedStudent.questions.length > 0 ? (
                <>
                  <p>{selectedStudent.questions[selectedStudent.questions.length - 1]}</p>
                  {selectedStudent.questions.length > 1 && (
                    <button onClick={toggleQuestions} className="view-more-button">
                      {showAllQuestions ? "Hide" : "View More"}
                    </button>
                  )}
                  {showAllQuestions && (
                    <ul>
                      {selectedStudent.questions.slice(0, -1).reverse().map((q, index) => (
                        <li key={index}>{q}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p>No past questions available.</p>
              )}
            </div>
            <button onClick={() => generateStudentReport(selectedStudent.student_id)} className="generate-report-button">
              Generate Report
            </button>
            {report && <p className="report">Report: {report}</p>}
            <button onClick={closePopup} className="close-popup">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPage;