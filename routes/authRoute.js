import express from 'express';
import authControllers from '../controllers/authControllers.js';
import {addQuizController, fetchQuiz} from '../controllers/addQuizController.js';
import {addNotification, fetchNotification, fetchRoute, markRead, unreadCount} from '../controllers/notificationController.js';
import signUpValidationInput from '../middlewares/authRegisterValidation.js';
import quizController from "../controllers/quizController.js";
import authValidation from "../middlewares/passport.js";
import resetValidate from "../middlewares/resetPassword.js";
const router = express.Router();


router.post("/login", authControllers.login);
router.post("/registration", authValidation, authControllers.register);
router.post("/passwordReset",   authControllers.passwordReset);
router.post("/passwordResetToken",   authControllers.passwordResetToken);
router.post("/passwordReseted", resetValidate, authControllers.passwordReseted);


//quiz
router.post("/quiz/answer", quizController)
router.post("/add-quiz", addQuizController)
router.get("/fetch-quiz-data", fetchQuiz);

//notification
router.post("/add-notification", addNotification)
router.get("/fetch-notification", fetchNotification)
router.post('/fetch-notifications', fetchRoute)
router.post('/notifications/mark-read', markRead);
router.post('/unread-count', unreadCount)


export default router;