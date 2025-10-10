import mysql2 from "mysql2/promise";

export const pool = mysql2.createPool({
  host: "sql12.freesqldatabase.com",
  user: "sql12802174",
  password: "L5LDLkRHuL",
  database: "sql12802174",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established");
    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};
