const jwt = require("jsonwebtoken"); // Make sure to import jwt
const usermodel = require("../models/user_model"); // Adjust the path to your user model

exports.superadminMiddleware = async (req, res, next) => {
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
    
    // decoded will contain payload data, here we have user id in payload data
    const user = await usermodel.findById(decoded.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // Check the role! Make sure "Admin" matches exactly what is in your user_model.js enum
    if (user.role !== "Admin") { 
      return res.status(403).json({
        success: false,
        message: "Forbidden access. Super Admin only.",
      });
    }

    // FIXED: Assigned the 'user' variable you found in the DB to req.user
    req.user = user; 
    
    next();
  } catch (err) {
    console.error("Error in superadminMiddleware", err);
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