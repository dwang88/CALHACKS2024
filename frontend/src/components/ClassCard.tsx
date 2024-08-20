import React from "react";
import { Class } from "../types";
import { useNavigate } from "react-router-dom";

type ClassCardProps = {
    specClass: Class
}

const ClassCard: React.FC<ClassCardProps> = ({ specClass }) => {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/teacher/classes/${specClass.class_id}/`)
    }
    
    return (
        <div onClick={handleClick} style={{ cursor: 'pointer' }}>
            <h1>{specClass.name}</h1>
        </div>
    )

}

export default ClassCard;