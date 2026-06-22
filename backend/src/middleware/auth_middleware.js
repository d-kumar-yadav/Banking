const usermodel = require("../models/user_model");
const employeemodel = require("../models/employe_model");
const jwt = require("jsonwebtoken");
const blacklistmodel = require("../models/blacklist");
require("dotenv").config();

exports.authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.body?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    const isBlacklisted = await blacklistmodel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Kindly login again",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await usermodel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next(); 
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

exports.managermiddleware = async (req, res, next) => {
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
    const user = await employeemodel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const role = user.role ? user.role.toLowerCase() : "";
    if (role !== "manager" && role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden access. Manager or Superadmin only.",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in managermiddleware", err);
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

exports.employeeMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.body?.token;
    const authHeader = req.headers?.authorization;

    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader; 
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await employeemodel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const role = user.role ? user.role.toLowerCase() : "";
    if (role !== "employee" && role !== "manager" && role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden access.",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error in managermiddleware", err);
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
    
    let user = await employeemodel.findById(decoded.id);
    if (!user) {
      user = await usermodel.findById(decoded.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
