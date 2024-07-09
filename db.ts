import { Pool } from "pg";

// const schemaFile = require("fs").readFileSync("./schema.sql", "utf8");

const client = new Pool({
  user: "postgres",
  host: "localhost",
  port: 5432,
  database: "check_game",
  password: "porteger",
});

async function connectAndLoadSchema() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // await client.query(schemaFile);
    // console.log('Schema loaded successfully');
  } catch (error) {
    console.error('Error loading schema:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

module.exports = connectAndLoadSchema();
