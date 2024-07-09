import { Pool } from "pg";

export interface User {
    email?: string;
    password?: string;
    refreshToken?: string[];
    roles?: string[];
}

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  port: 5432,
  database: "check_game",
  password: "portege",
});

export async function executeQuery(query: string, values: any[] = []) {
  // const client = await pool.connect();
  // console.log("db connected successfully");
  try {
    const result = await pool.query(query, values);
    console.log("Query executed successfully:", result);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error; // Re-throw the error for handling in the calling function
  } 
  // finally {
  //   await client.release();
  //   console.log("Connection closed");
  // }
}
export async function fetchUser(email: string, desiredFields: string) {
    const userQuery = `SELECT ${desiredFields} FROM users WHERE email = $1`;
    const result = await executeQuery(userQuery, [email]); // Use the executeQuery function
  
    if (result.rows.length === 0) {
      return null; // Indicate no user found
    }
  
    const user = result.rows[0]; // Assuming single user for this example
  
    return user;
  }
  export async function updateUser(email: string, updateData: Object) {
    const fieldsToUpdate = Object.keys(updateData).join(", "); // Build comma-separated list of fields
    const placeholders = fieldsToUpdate.split(",").map((field) => "$" + fieldsToUpdate.indexOf(field) + 1); // Create placeholders
  
    const updateQuery = `
      UPDATE users
      SET (${fieldsToUpdate}) = (${placeholders.join(", ")})
      WHERE email = $${placeholders.length + 1}
    `;
  
    const values = [
      ...Object.values(updateData), // Update data values
      email, // User ID for WHERE clause
    ];
  
    try {
      await executeQuery(updateQuery, values);
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }
  
  export async function findUserByField(field: string, value:any[], desiredFields = "*") {
    let query = "";

    if (field !== "refresh_token") {
        query = `
            SELECT ${desiredFields}
            FROM users
            WHERE ${field} = $1
            `;
    } else {
        query = `
            SELECT ${desiredFields}
            FROM users
            WHERE refresh_token @> $1
        `;
    }
  
    try {
        const result = await executeQuery(query, value);
        if (result.rows.length === 0) {
        return null; // User not found
      }
  
      const user = result.rows[0]; // Assuming single user for this example
      return user;
    } catch (error) {
      console.error("Error finding user:", error);
      throw error; // Re-throw for handling in the calling function
    }
  }
  


// Example of inserting a user

