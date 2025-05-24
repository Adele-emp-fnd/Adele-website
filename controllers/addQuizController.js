import db from "../config/db.js";



export const addQuizController = async (req, res) => {

    console.log("add quiz route hitted");

    const {question, answer,option1,option2 } = req.body;

    try {
        const newQuestion = await db.query("SELECT * FROM quiz WHERE question = $1", [question]);
    const alreadyExistedQuestion = newQuestion.rows;

    console.log(newQuestion.rows);
    if (alreadyExistedQuestion.length === 0) {
        const insertedQuestion = await db.query("INSERT INTO quiz (question, answer,  option1, option2 ) VALUES ($1, $2, $3, $4) RETURNING *", [question, answer, option1, option2]);
        res.status(200).json({message: "successfully added", status:"ok", detail: insertedQuestion});
        
    }else{
        res.status(500).json({message: "question already exist"})


    }
    } catch (error) {
        console.log("database internal error: ", error);
        
    }
    
}

export const fetchQuiz = async (req, res)=>{
    const department = req.headers.department;

    console.log("fetch quiz data route hitted");

    const quizData = await db.query("SELECT * FROM quiz;");
    console.log(quizData.rows);
    const numberOfQuestions = quizData.rows.length;
    console.log(`there's ${numberOfQuestions} questions in the db`);
    res.status(200).json({message: "fetch successfull", quizData: quizData, numberOfQuestions: numberOfQuestions})
}