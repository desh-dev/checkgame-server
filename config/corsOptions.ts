import allowedOrigins from "./allowedOrigins"
// Update the origin property in corsOptions to ensure it's of type 'string' and not allowing 'undefined'
const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your actual origin
    methods: 'GET,POST,PUT,DELETE', // Replace with the allowed methods
    allowedHeaders: 'Content-Type, Access-Control-Allow-Origin', // Replace with the allowed headers
    credentials: true, // Set to true if you want to include cookies in the request
    maxAge: 86400, // Set the maximum age of the preflight request in seconds
  };

export default corsOptions