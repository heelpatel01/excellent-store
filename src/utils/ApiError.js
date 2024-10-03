// ApiError class extends the built-in Error class to create custom error objects.
// In Java, this is similar to creating a class that extends Exception or RuntimeException.
class ApiError extends Error {
  // Constructor with multiple parameters to initialize properties of the error.
  // In Java, you would define a constructor with the same structure using super() for the parent class.
  constructor(
      statusCode,                    // HTTP status code to represent the type of error (e.g., 404 for not found)
      message = "Something went wrong",  // Error message to describe the issue (default: "Something went wrong")
      errors = [],                      // Array to hold detailed error information (e.g., validation errors)
      stack = ""                        // Optional stack trace for debugging (default: empty string)
  ){
      super(message); // Calls the constructor of the parent class 'Error' with the error message
      // this.statusCode in Java would be initialized similarly in the constructor.
      this.statusCode = statusCode;     // Sets the HTTP status code for the error
      this.data = null;                 // Placeholder property, can be used to store error-related data
      this.message = message;           // Sets the error message (already set by `super`, but can be redefined here)
      this.success = false;             // Indicates success status (false by default for errors)
      this.errors = errors;             // Sets additional error details if any (default is empty array)

      // Setting the stack trace for debugging.
      // Similar to how you capture stack trace in Java with Exception classes.
      if (stack) {
          this.stack = stack; // If a stack trace is passed, set it explicitly
      } else {
          // Captures stack trace excluding constructor to keep it clean.
          Error.captureStackTrace(this, this.constructor);
      }
  }
}

// Export the class for use in other modules (similar to public class visibility in Java)
export { ApiError };