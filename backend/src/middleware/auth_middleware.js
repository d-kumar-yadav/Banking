const usermodel = require("../models/user_model");
const jwt = require("jsonwebtoken");
const blacklistmodel = require("../models/blacklist");
require("dotenv").config();

exports.authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.body?.token;
    //The ?. is called the Optional Chaining Operator. It is a safety feature in JavaScript.
    //  If req.cookies is undefined (which happens if you don't have a cookie-parser middleware set up,
    //  or if no cookies were sent), trying to read .token would normally crash your entire server with a TypeError.
    //  The ?. stops the crash and just gracefully returns undefined instead.

    // const authHeader = req.headers?.authorization;
    // // token look like this Authorization: Bearer eyJhbGciOiJIUzI1...
    // //  we need to extract token using split on basis of space and convert into array
    // // now it look like this ["Bearer", "eyJhbGciOiJIUzI1..."] we need to take second element of array which is token
    // // some time Bearer is not included in autorisation it look like this Authorization: eyJhbGci

    // if (authHeader) {
    //   if (authHeader.startsWith("Bearer ")) {
    //     token = authHeader.split(" ")[1];
    //   } else {
    //     token = authHeader; // Fallback if "Bearer " prefix is missing
    //   }
    // }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    // user is login through blacklisted token
    const isBlacklisted = await blacklistmodel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Kindly login again",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // decoded  will contain payload data , here  we have user id in payload data
    const user = await usermodel.findById(decoded.id);
    // user is document_type_object conatin all the thing in user module

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    // this line is important because it attaches the authenticated user object to the request object (req.user),
    //  making it accessible in subsequent middleware functions or route handlers or next functions that require authentication.
    // if i not pass it then next middleware or function ,route know that user is authenticated but it will never who is the user

    next(); // call the next middleware or route handler in the chain
  } catch (err) {
    console.error("Error in authmiddleware", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired, please login again",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};

exports.sytemusermiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.body?.token;
    const authHeader = req.headers?.authorization;

    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader; // Fallback if "Bearer " prefix is missing
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // decoded  will contain payload data , here  we have user id in payload data
    const user = await usermodel.findById(decoded.id);

    if (user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in sytemusermiddleware", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired, please login again",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
