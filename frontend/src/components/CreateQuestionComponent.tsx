import React, { useState } from "react";
import { Question } from "../types";

interface CreateQuestionProps {
    onAddQuestion: (question: Question) => void;
}

const CreateQuestion: React.FC<CreateQuestionProps> = ({ onAddQuestion }) => {
    const [questionCreated, setQuestionCreated] = useState<boolean>(false);
    const [question, setQuestion] = useState<string>("");
    const [options, setOptions] = useState<string[]>([]);
    const [questionType, setQuestionType] = useState<string>("frq");
    const [correctAnswer, setCorrectAnswer] = useState<string>("");
    const [currentOption, setCurrentOption] = useState<string>("");

    const createQuestion = async () => {
        try {
            const questionData = {
                question: question,
                options: options,
                type: questionType,
                correctAnswer: correctAnswer
            }
    
            const response = await fetch("http://localhost:5000/create_assignment_question/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(questionData)
            })
    
            if(!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
    
            const data = await response.json();
            const questionId = data.question_id;
            const newQuestionData: Question = {
                _id: questionId,
                question: questionData.question,
                options: questionData.options,
                type: questionData.type,
                correctAnswer: questionData.correctAnswer
            }
            onAddQuestion(newQuestionData);
            setCorrectAnswer("");
            setCurrentOption("");
            setOptions([]);
            setQuestion("");
            setQuestionType("frq");
            setQuestionCreated(true);
            console.log("Question added successfully: ", data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value);
    }

    const handleCorrectAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCorrectAnswer(event.target.value);
    }

    const handleSelectType = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const val = event?.target.value;
        setQuestionType(val);
    }

    const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentOption(event.target.value);
    }

    const onOptionCreate = () => {
        if (currentOption.trim() !== "") {
            setOptions([...options, currentOption]);
            setCurrentOption("");
        }
    }

    return (
        <div>
            <select value={questionType} onChange={handleSelectType}>
                <option value="frq">frq</option>
                <option value="mcq">mcq</option>
            </select>

            <div>
                <label htmlFor="question">Question Text:</label>
                    <input
                        type="text"
                        id="question"
                        value={question}
                        onChange={handleQuestionChange}
                    />

                {questionType === "mcq" && (
                    <div>
                        <label htmlFor="option">Option Text</label>
                        <input
                            type="text"
                            id="option"
                            value={currentOption}
                            onChange={handleOptionChange}
                        />
                        <button type="button" onClick={onOptionCreate}>Add option</button>
                        {options.length > 0 ? (
                            options.map(option => (
                                <p key={option}>{option}</p>
                            ))  
                        ) : (
                            <p>No options added</p>
                        )}
                    </div>
                )}
                
                <div>
                    <label htmlFor="correctAnswer">Correct Answer:</label>
                    <input
                        type="text"
                        id="correctAnswer"
                        value={correctAnswer}
                        onChange={handleCorrectAnswerChange}
                    />
                </div>
                
                <button type="button" onClick={createQuestion}>Create Question</button>
                {questionCreated && <p>Question Added!</p>}
            </div>
        </div>
    )
}

export default CreateQuestion;