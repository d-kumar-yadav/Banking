const express= require("express");
 const router = express.Router();
 const {register ,login , logout, sendRegistrationOtp ,resesndRegistrationOtp , tokenverify, getProfile} = require("../controller/auth_controll");
 const {authMiddleware, sytemusermiddleware}= require("../middleware/auth_middleware");

 router.post("/register",register);
 
 router.post("/login",login);
 router.post("/resend-otp", resesndRegistrationOtp);

  router.post("/logout",logout)
  router.post("/send-otp", sendRegistrationOtp);
  router.get("/verify" ,tokenverify)
  router.get("/profile", authMiddleware, getProfile);

  
  
 module.exports= router;
 