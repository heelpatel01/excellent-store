// ApiResponse class to define the structure of success responses in the API.
// This is analogous to creating a Response object class in Java with fields for status code, data, and message.
class ApiResponse {
  // Constructor initializes the properties for statusCode, data, and message.
  // Similar to how you would define a constructor in a Java class to initialize fields.
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;   // HTTP status code indicating success (e.g., 200 for OK)
    this.data = data;               // Response data (e.g., fetched results from the database)
    this.message = message;         // Message to accompany the response (default: "Success")
    this.success = statusCode < 400; // Determines success status based on the status code (true if < 400)
  }
}

// Export the class for use in other modules (similar to public class visibility in Java)
export { ApiResponse };