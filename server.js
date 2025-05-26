import express from 'express';
import cors from "cors";
import authRoute from './routes/authRoute.js';
import adminRoute from "./routes/adminRoute.js"
import { fileURLToPath } from "url";
import path from "path";
import courseRoutes from "./routes/courseRoutes.js";
import { getAllStudents, getAllCourses, newEnrollmentscount, addNewCourse, studentData } from "./config/db.js";
import { phoneEdit, emailEdit } from "./controllers/infoEditController.js";
import { config } from 'dotenv';
import { Parser } from "json2csv";
import { courseReg } from "./controllers/courseRegController.js";
import db from "./config/db.js";
import router from './routes/authRoute.js';

import nodemailer from "nodemailer";
import mailchimp from "@mailchimp/mailchimp_marketing";
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/api', authRoute)
app.use("/api", courseRoutes);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use("/Assets", express.static(path.join(__dirname, "../hovahAdele-frontend/Dashboard/Assets")));
app.use("/images", express.static(path.join(__dirname, "../hovahAdele-frontend/Dashboard/images")));
app.use("/asset", express.static(path.join(__dirname, "../hovahAdele-frontend/asset")));
app.use("/images", express.static(path.join(__dirname, "../hovahAdele-frontend/images")));
app.use("/style", express.static(path.join(__dirname, "../hovahAdele-frontend/style")));
app.use("/javascript", express.static(path.join(__dirname, "../hovahAdele-frontend/javascript")));




//mailchimp configuration

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,  // e.g. "123abc-us6"
  server: process.env.MAILCHIMP_SERVER    // e.g. "us6"
});


//emailing 
// Configure your email transport (e.g. SendGrid SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // e.g. smtp.sendgrid.net
  port: process.env.EMAIL_PORT,      // e.g. 587
  secure: process.env.EMAIL_PORT == 465,
  auth: {
  user: process.env.EMAIL_USER,     // e.g. "apikey" for SendGrid
  pass: process.env.EMAIL_PASS,     // your SMTP/API key
  },
});


// Endpoint that receives the user’s email and forwards it to you
app.get("/", (req, res)=>{
  res.send("welcome to adele empowerment foundation")
})
const LIST_ID = process.env.MAILCHIMP_LIST_ID;
app.post('/submit-email', async (req, res) => {
  console.log("submit email route hitted!!!");

  const { email, name } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const response = await mailchimp.lists.addListMember(LIST_ID, {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: name,  // First Name
      }
    });
    console.log("Added subscriber:", response.id);
    res.json({ status: "success", id: response.id });
  } catch (err) {
    console.error("Mailchimp error:", err);
    res.status(500).json({ status: "failed", error: err.response?.body?.detail || err.message });
  }
});





app.get("/student/:page", (req, res) => {
  const { page } = req.params;
  const filePath = path.join(__dirname, "../hovahAdele-frontend", "Dashboard/student-dashboard", `${page}.html`);

  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("Page not found");
  });
});


app.get("/admin/:page", (req, res) => {
  const { page } = req.params;
  const filePath = path.join(__dirname, "../hovahAdele-frontend", "Dashboard/admin-dashboard", `${page}.html`);

  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("Page not found");
  });
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await getAllStudents();
    console.log(students);
    res.json(students);
  } catch (err) {
    res.status(500).send("Error retrieving students data");
  }
});



app.get("/api/user", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM student_registration JOIN users ON student_registration.id = users.id;"
    );

    res.json(rows)


  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
});


app.get("/api/courses", async (req, res) => {
  try {
    console.log("api/courses route hitted");

    const courses = await getAllCourses();
    console.log(courses);
    res.json(courses);
  } catch (err) {
    res.status(500).send("Error retrieving courses");
  }
});

app.get("/api/new-enrollments", async (req, res) => {
  try {
    const enrollments = await newEnrollmentscount();
    console.log(enrollments);
    res.json(enrollments);
  } catch (err) {
    res.status(500).send("Error retrieving enrollments");
  }
});

app.get("/api/student-data", async (req, res) => {
  try {
    const data = await studentData();
    console.log(data);
    res.json(data);
  } catch (err) {
    res.status(500).send("Error retrieving student data");
  }
});

app.post("/api/new-course", async (req, res) => {
  const { name, description, startDate, endDate, duration, modulesArray } =
    req.body;

  console.log("Course data received:", req.body); // Log the received data

  try {
    await addNewCourse(
      name,
      description,
      startDate,
      endDate,
      duration,
      modulesArray
    );
    res.status(201).json({ message: "Course created successfully" });
  } catch (err) {
    console.error("Error creating course:", err); // Log the error if any
    res.status(500).json({ error: "Error creating course" });
  }
});

app.get("/api/download-report", async (req, res) => {
  try {
    const query = `
      SELECT * FROM student_registration
      JOIN users ON student_registration.id = users.id
    `;

    const { rows } = await db.query(query);

    const formattedRows = rows.map((row) => ({
      ...row,
      date_of_birth: new Date(row.date_of_birth).toLocaleDateString(),
      date: new Date(row.date).toLocaleDateString(),
    }));

    const fields = [
      "last_name",
      "first_name",
      "gender",
      "date_of_birth",
      "email",
      "phone",
      "address",
      "lga",
      "state",
      "nin",
      "department",
      "date"
    ];

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(formattedRows);

    res.header("Content-Type", "text/csv");
    res.attachment("students_report.csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
});

app.get("/api/student", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM student_registration JOIN users ON student_registration.id = users.id;"
    );

    res.json(rows)


  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
});

app.post("/api/support", async (req, res) =>{
  console.log("contact support route hitted");

  const {email, message, name } = req.body
  console.log("email details are", email, message, name);

  const maiOption = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: "Technical support",
    text: `Name: ${name}\n\n Email: ${email}\n\n Problem: ${message}`
  }

  transporter.sendMail(maiOption, (error, info)=>{
    if (error) {
      console.log("error sending mail: ", error);
      res.status(500).json({message:"failed to send mail. ", status: "failed"})
      
    }else{
      console.log("email sent " + info.response);
      res.status(200).json({message: "Email sent successfully!", status: "success"})
      
    }
  })
  
  
})



app.post("/api/support-team", async (req, res) =>{
  console.log("contact support-team route hitted");

  const {email, message, name } = req.body
  console.log("email details are", email, message, name);

  const maiOption = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: "Technical team support",
    text: `Name: ${name}\n\n Email: ${email}\n\n Problem: ${message}`
  }

  transporter.sendMail(maiOption, (error, info)=>{
    if (error) {
      console.log("error sending mail: ", error);
      res.status(500).json({message:"failed to send mail. ", status: "failed"})
      
    }else{
      console.log("email sent " + info.response);
      res.status(200).json({message: "Email sent successfully!.", status: "success"})
      
    }
  })
  
  
})



app.put("/api/update-phone", async (req, res) => {
  const { id, value } = req.body;

  try {
    const { rowCount } = await db.query(
      "UPDATE users SET phone = $1 WHERE id = $2",
      [value, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Phone number updated successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/update-email", async (req, res) => {
  const { id, value } = req.body;

  try {
    const { rowCount } = await db.query(
      "UPDATE users SET email = $1 WHERE id = $2",
      [value, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Phone number updated successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.delete("/api/delete-course/:name", async (req, res) => {
  const courseName = req.params.name;

  try {
    await db.query("DELETE FROM courses WHERE name = $1", [courseName]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting course");
  }
});

app.post("/api/course-registration", async (req, res) => {
  const { id, firstName, lastName, dob, gender, country, state, address, department, qualification, nin, lga } = req.body;

  try {
    await courseReg(id, firstName, lastName, dob, gender, country, state, address, department, qualification, nin, lga);
    res.status(201).json({ message: "Registered Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error during registration" });
  }
});



app.get("/manageUsers", adminRoute)

app.post("/manageUsers/delete", async (req, res) => {

  try {
    console.log("delete user route hitted");

    const { email, phone } = req.body;

    console.log("email and phone is :", email, phone);

    const action = await db.query("DELETE FROM users WHERE email = $1", [email])



  } catch (error) {
    console.log("internal error:", error);

  }

})


app.post("/manageUsers/edit", async (req, res) => {
  console.log("edit user route hitted");

  const { orinalEmail, editedEmail, editedPhone } = req.body

  console.log(orinalEmail, editedEmail, editedPhone);

  if (!orinalEmail || !editedEmail || !editedPhone) {

    console.log("detail not complete");
    res.status(400).json({ status: "error", message: "detail not complete" })


  } else {
    const edit = await db.query("UPDATE users SET email = $1, phone = $2 WHERE email = $3", [editedEmail, editedPhone, orinalEmail]);
    res.status(200).json({ status: "ok", message: "user details updated" })
  }





})

app.post("/registration", authRoute)
app.post("/login", authRoute)
app.post("/passwordReset", authRoute)
app.post("/passwordResetToken", authRoute)
app.post("/passwordReseted", authRoute)

app.post("/quiz/answer", authRoute)


//fetch quiz data from db and send to the frontend
app.get("/fetch-quiz-data", authRoute)



app.post("/add-quiz", authRoute)


app.post("/add-notification", authRoute)


app.post('/fetch-notifications', authRoute);



app.post('/notifications/mark-read', authRoute);




app.post('/unread-count', authRoute);







app.listen(port, (err) => {

  if (err) {
    console.log(err);
  }

  console.log(`Server is running on port ${port}`);


});

