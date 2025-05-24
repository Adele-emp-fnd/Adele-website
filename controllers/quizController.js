import db from "../config/db.js";


const quizController = async (req, res)=> {

  const department = req.headers.department;
  console.log("Department is:", department);


    try {
      // Fetch the quiz questions for the given department
      const fetchedQuiz = await db.query("SELECT * FROM quiz");
      const quizLength = fetchedQuiz.rows.length;
      console.log("The quiz length is:", quizLength);

      let score = 0;
      var average = quizLength/2;

      for (let i = 0; i < quizLength; i++) {
          let questionNumber = `q${i + 1}`;
          let userAnswer = req.body[questionNumber]; // Extract user's answer dynamically

          if (!userAnswer) {
              console.log(`No answer provided for ${questionNumber}`);
              continue; // Skip to next iteration if answer is missing
          }

          userAnswer = userAnswer.toLowerCase(); // Normalize user answer for comparison
          const correctAnswer = fetchedQuiz.rows[i].answer.toLowerCase(); // Normalize DB answer

          console.log(`Question ${i + 1}: User Answer - ${userAnswer}, Correct Answer - ${correctAnswer}`);

          if (userAnswer === correctAnswer) {
              score++; 
          } 
      }

      console.log(`Total Score: ${score} out of ${quizLength}`);
      if (score > average) {
        res.status(200).json({message: "congratulation: you pass the test", score: score, quizLength: quizLength, passed: true})
        
      }else{
        res.status(200).json({message: "you fail the test", score: score, quizLength: quizLength, passed: false})

      }

  } catch (error) {
      console.error("Error fetching quiz:", error);
  }







//     const { q1, q2, q3 } = req.body;
//     console.log("q1, q2, q3 are: ", q1, q2, q3);

//     try {
//       const result = await db.query("SELECT id, question, answer FROM quiz WHERE id IN (2, 3, 4)");
//         var totalQuestions = [q1, q2, q3].length ;
//         var average = [q1, q2, q3].length / 2;
//         var pass = false;

//         console.log(average);
//       // Store correct answers from DB
//       const correctAnswers = {};
//       result.rows.forEach(row => {
//         correctAnswers[row.id] = row.answer;
//       });
  
//       // Compare user answers with correct answers
//       let score = 0;
//       if (q1 === correctAnswers[4].toLowerCase()) score++;
//       if (q2 === correctAnswers[2].toLowerCase()) score++;
//       if (q3 === correctAnswers[3].toLowerCase()) score++;

//       console.log(`q1 is = ${q1.toLowerCase()} and the db answer is ${correctAnswers[4].toLowerCase()}` );
//       if (score > average) {
//         pass = true;

//         res.status(200).json({
//             message: `pass`,
//             score:score,
//             pass:true,
//             totalQuestions: totalQuestions,

//           });
        
//       }else{
//         res.status(402).json({
//             message: "faild",
//             score:score,
//             pass: false,
//             totalQuestions: totalQuestions,
//         })
//       }
     
//       console.log(`your score is: ${score} out of ${totalQuestions}`);

  
//     } catch (error) {
//       console.error("Error checking quiz:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }

 }

 


 export default quizController;