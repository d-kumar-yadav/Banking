const jwt = require("jsonwebtoken"); // Make sure to import jwt
const employeemodel= require("../models/employe_model");

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
    const user = await employeemodel.findById(decoded.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // Check the role! Make sure it matches what is in your employe_model.js enum
    if (!user.role || user.role.toLowerCase() !== "superadmin") { 
      return res.status(403).json({
        success: false,
        message: "Forbidden access. Super Admin only.",
      });
    }


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