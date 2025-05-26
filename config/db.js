import express from 'express'
import pg from "pg";
import dotenv from 'dotenv';
dotenv.config();




const db = new pg.Client(
    {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB,
        password: process.env.DB_PASSWORD,
        port:process.env.DB_PORT,
         ssl: {
        rejectUnauthorized: false  // ← this is key for Render's DB
    }
    }
)


db.connect().then(()=>{
    console.log("database connected");
}).catch((error)=>{
    console.log("database internal error: ", error);
})


export default db;
export async function getAllStudents() {
  try {
    const result = await db.query(`
        SELECT * FROM student_registration
        JOIN users ON student_registration.id = users.id;`);
    return result.rows
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving students data");
    throw err;
  }
};

export async function getAllCourses() {
  try {
    const courseData = await db.query(`SELECT * FROM courses;`);
    return courseData.rows
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving students data");
    throw err;
  }
};

export async function newEnrollmentscount() {
  try {
    const { rows } = await db.query(`
      SELECT * FROM student_registration
      WHERE date >= NOW() - INTERVAL '7 days'
    `);

    return rows;
  } catch (err) {
    console.error("Database Query Error:", err);
    throw err;
  }
}

export async function addNewCourse(
  name,
  description,
  startDate,
  endDate,
  duration,
  modulesArray
) {
  try {
    const query = `INSERT INTO courses (name, description, start_date, end_date, duration, modules)
                   VALUES ($1, $2, $3, $4, $5, $6)`;

    console.log("Executing query:", query); // Log the query to verify

    await db.query(query, [
      name,
      description,
      startDate,
      endDate,
      duration,
      JSON.stringify(modulesArray),
    ]);
    console.log("Course added to database"); // Log if insertion is successful
  } catch (error) {
    console.error("Internal Database Error:", error); // Log any errors
  }
}

export async function studentData() {
  try {
    const studentData = await db.query(`SELECT * FROM student_registration JOIN users ON student_registration.id = users.id;`);
    return studentData.rows;
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving student data");
    throw err;
  }
};