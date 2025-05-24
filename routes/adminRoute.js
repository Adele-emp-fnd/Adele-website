import express from "express";
const adminRouter = express.Router();
import adminController from "../controllers/adminController.js";

adminRouter.get("/manageUsers", adminController.manageUser);


export default adminRouter ;