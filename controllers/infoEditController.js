import db from "../config/db.js"



export async function phoneEdit(phone, id){
  const query = `UPDATE users SET phone = $1 WHERE id = $2`;

  await db.query(query, [phone, id]);
}

export async function emailEdit(email, id){
  const query = `UPDATE users SET email = $1 WHERE id = $2`;

  await db.query(query, [email, id]);
}