import express from "express";
import { getAllCourses } from "../models/courseModel.js";

const router = express.Router();

router.get("/courses", async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
