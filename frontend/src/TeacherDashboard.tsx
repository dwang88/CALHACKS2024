import { useEffect, useState } from "react"
import axios, { AxiosResponse } from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface Student {
    name: string;
    report: string;
    classes: Class[];
  }
  
  interface Class {
    name: string;
    report: string;
    students: Student[];
  }

const TeacherDashboard = () => {

    const auth = getAuth();

    const [classes,setClasses] = useState<Class[]>([])
    const [report,setReport] = useState<string>("")

    useEffect(() => {
        const fetchClasses = async () => {
          try {
            const response: AxiosResponse<Class[]> = await axios.get(
              `http://localhost:5000/get_classes_for_teacher/6677f8e998646b6a255eb947`
            );
            console.log(response);
            console.log(response.data);
            setClasses(response.data);
            console.log(classes);
          } catch (err) {
            console.error(err);
          }
        };
        fetchClasses();
      }, []);

    //   const handleClick = (class_name:string) => async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //     const requestBody = {
    //         student_id: "6677f93998646b6a255eb949",
    //         teacher_id: auth.currentUser?.uid,
    //         class_name: class_name
    //     }
    //     const response: AxiosResponse<{ report: string }> = await axios.post("http://localhost:5000/generate_student_response", requestBody)
    //     setReport(response.data.report);
    //   }

    return (
        <>
           <h1>Teacher Dashboard</h1>
            <ul>
                {Array.isArray(classes) && classes.map((classItem, index) => (
                <li key={index}>
                    <h2>{classItem.name}</h2>
                    <p>Report: {classItem.report}</p>
                    <ul>
                    {classItem.students.map((student: any, studentIndex: number) => (
                        <li key={studentIndex}>{student.name}</li>
                    ))}
                    </ul>
                    {/* <button onClick={handleClick(classItem.name)}>Generate student report</button> */}
                </li>
                ))}
            </ul>
            {/* {report && (
                <div>
                    <h2>Generated Report</h2>
                    <p>{report}</p>
                </div>
            )} */}
        </>
    )
}

export default TeacherDashboard;