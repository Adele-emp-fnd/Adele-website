import db from "../config/db.js"



export async function courseReg(id, firstName, lastName, dob, gender, country, state, address, department, qualification, nin, lga){
  const query = `INSERT INTO student_registration (id, first_name, last_name, date_of_birth, gender, country, state, address, department, qualification, nin, lga) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

  await db.query(query, [id, firstName, lastName, dob, gender, country, state, address, department, qualification, nin, lga]);
}