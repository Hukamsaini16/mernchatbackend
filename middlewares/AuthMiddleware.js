
import jwt from "jsonwebtoken";

// Middleware function to verify JWT
export const verifyToken = (req, res, next) => {
  // Ensure the cookie-parser middleware is used
  //console.log(req.cookies);
  if (!req.cookies) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  // Get the token from cookies
  const token = req.cookies.jwt;
   //console.log({token});
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid!" });
    }

    // Set userId in the request object for use in subsequent middleware/routes
    req.userId = payload.userId;

    // Proceed to the next middleware
    next();
  });
};



