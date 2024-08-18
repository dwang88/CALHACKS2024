import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Class, Student } from "../types";
import "./ClassPage.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import CreateAssignmentForm from "../components/CreateAssignment";
import { getAuth } from "firebase/auth";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [studentIdToAdd, setStudentIdToAdd] = useState('');
  const auth = getAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [showAddStudentPopup, setShowAddStudentPopup] = useState(false);

  useEffect(() => {
    const fetchStudent = async (studentId: string): Promise<Student | undefined> => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get_student/${studentId}/`, {
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
        const response = await fetch(`http://127.0.0.1:5000/get_class/${classId}/`, {
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

  const fetchClasses = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        console.error("No user logged in");
        return;
    }
    const endpoint = `http://127.0.0.1:5000/get_classes_of_teacher/${uid}/`;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        setClasses(data.Classes);
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const handleAddStudent = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!studentIdToAdd) {
    alert('Please enter a student ID');
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:5000/enroll_student/${classId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id: studentIdToAdd }),
    });

    if (!response.ok) {
      throw new Error('Failed to add student');
    }

    const result = await response.json();
    alert(result.message);
    setStudentIdToAdd('');
    setShowAddStudentPopup(false);
    // Refresh the class list
    fetchClasses();
  } catch (error) {
    console.error('Error adding student:', error);
    alert('Failed to add student. Please try again.');
  }
};

  const generateStudentReport = async (studentId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/generate_student_report/${studentId}/`, {
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

  const calculateClassAverage = () => {
    if (!students) return 0;
    const totalQuestions = students.reduce((sum, student) => sum + student.questions.length, 0);
    return totalQuestions / students.length;
  };

  const chartData = {
    labels: ['Student', 'Class Average'],
    datasets: [
      {
        label: 'Number of Questions Asked',
        data: [selectedStudent ? selectedStudent.questions.length : 0, calculateClassAverage()],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1,
      },
    ],
  };


  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Questions Asked',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

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
      <div className="content-wrapper">
        <div className="menu">
          <h2 className="teacher-actions">Teacher Actions</h2>
          <button onClick={() => setShowCreateAssignment(true)}>Create Assignment</button>
          <button onClick={() => setShowAddStudentPopup(true)}>Add Student</button>
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
      </div>
      {showPopup && selectedStudent && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{selectedStudent.name}</h2>
            <div className="student-details-grid">
              <div className="classCard">
                <h3>Struggle Score</h3>
                <p className="struggleScore">
                  {(() => {
                    const struggleScore = (selectedStudent.questions.length * 0.40) + (selectedStudent.report.length * 0.10);
                    return struggleScore.toFixed(2);
                  })()}
                </p>
              </div>
              <div className="classCard">
                <h3>Questions Asked</h3>
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="classCard">
                <h3>Student ID</h3>
                <p>{selectedStudent.student_id}</p>
              </div>
              <div className="classCard">
                <h3>Random Shit</h3>
                <p>{selectedStudent.name}</p>
              </div>
            </div>
            <div className="full-width-sections">
              <div className="classCard full-width">
                <h3>Past Questions</h3>
                {selectedStudent.questions && selectedStudent.questions.length > 0 ? (
                  <div className="content-container">
                    <ol>
                      {selectedStudent.questions.slice(0, showAllQuestions ? undefined : 3).reverse().map((q, index) => (
                        <li key={index}>{q}</li>
                      ))}
                    </ol>
                    {selectedStudent.questions.length > 1 && (
                      <div className="button-container">
                        <button onClick={toggleQuestions} className="view-more-button">
                          {showAllQuestions ? "Hide" : "View More"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No past questions available.</p>
                )}
              </div>
              <div className="classCard full-width">
                <h3>Past Reports</h3>
                {selectedStudent.report && selectedStudent.report.length > 0 ? (
                  <div className="content-container">
                    <ol>
                      {selectedStudent.report.slice(0, showAllReports ? undefined : 1).reverse().map((r, index) => (
                        <li key={index}>{r}</li>
                      ))}
                    </ol>
                    {selectedStudent.report.length > 1 && (
                      <div className="button-container">
                        <button onClick={toggleReports} className="view-more-button">
                          {showAllReports ? "Hide" : "View More"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No past reports available.</p>
                )}
              </div>
            </div>
            <button onClick={() => generateStudentReport(selectedStudent.student_id)} className="generate-report-button">
              Generate Report
            </button>
            {report && <p className="report">Report: {report}</p>}
            <button onClick={closePopup} className="close-popup">Close</button>
          </div>
        </div>
      )}
      {showCreateAssignment && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Create Assignment</h2>
            <CreateAssignmentForm classId={classId} />
            <button onClick={() => setShowCreateAssignment(false)} className="close-popup">Close</button>
          </div>
        </div>
      )}
        {showAddStudentPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Add Student</h2>
            <form onSubmit={handleAddStudent}>
              <input
                type="text"
                value={studentIdToAdd}
                onChange={(e) => setStudentIdToAdd(e.target.value)}
                placeholder="Enter Student ID"
                required
              />
              <button type="submit">Add</button>
            </form>
            <button onClick={() => setShowAddStudentPopup(false)} className="close-popup">Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClassPage;