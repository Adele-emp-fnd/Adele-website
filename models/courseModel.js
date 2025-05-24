import db  from '../config/db.js'

export const getAllCourses = async () => {
  const query = "SELECT * FROM courses";
  const result = await db.query(query);
  return result.rows;
};