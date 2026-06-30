const express= require("express");
const usermodel= require("../models/user_model");
const jwt= require("jsonwebtoken");
 const  {emailservice } = require("../service/email");
 const blacklistmodel= require("../models/blacklist");

require("dotenv").config();
const{sendSMS}= require("../service/sms");
const otpmodel = require("../models/otp_model");
const crypto = require("crypto");

exports.sendRegistrationOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        const otp = crypto.randomInt(100000, 999999).toString();

    
        await otpmodel.findOneAndUpdate(
            { phone },
            { otp, createdAt: Date.now() },
            { upsert: true, returnDocument: 'after' } // upsert creates a new doc if none is found
  // returnDocument: 'after'  return updated object after update otherwise it will return old object before update
        );

        await sendSMS(phone, `Your Banking App registration OTP is: ${otp}. It is valid for 10 minutes.`);

        const response = {
            success: true,
            message: "OTP sent successfully to your phone number"
        };

        // For development/testing purposes, include the OTP in the response.
        // This should be removed or disabled in a production environment.
        // if (process.env.NODE_ENV !== 'production') {
        //     response.otp_for_dev = otp;
        // }

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in sendRegistrationOtp", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to send OTP" });
    }
};

exports.resesndRegistrationOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        // Check the existing OTP record to enforce a 1-minute delay
        const existingOtp = await otpmodel.findOne({ phone });
        if (existingOtp && existingOtp.createdAt) {
            const timeDifference = Date.now() - existingOtp.createdAt.getTime();
            const oneMinute = 60 * 1000; // 1 minute in milliseconds

            if (timeDifference < oneMinute) {
                const timeLeft = Math.ceil((oneMinute - timeDifference) / 1000);
                return res.status(429).json({ 
                    success: false, 
                    message: `Please wait ${timeLeft} seconds before requesting a new OTP.` 
                });
            }
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        await otpmodel.findOneAndUpdate(
            { phone },
            { otp, createdAt: Date.now() },
            { upsert: true, returnDocument: 'after' }
        );          
        await sendSMS(phone, `Your Banking App registration OTP is: ${otp}. It is valid for 10 minutes.`);

        const response = {
            success: true,
            message: "OTP resent successfully to your phone number"
        };

        // // For development/testing purposes, include the OTP in the response    
        // if (process.env.NODE_ENV !== 'production') {
        //     response.otp_for_dev = otp;
        // }   
        
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in resendRegistrationOtp", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to resend OTP" });
    }   
};


exports.register= async(req,res) =>{

 try{
  const { email,name, password , phone , otp, gender }= req.body;
  
     if(!email || !name || !password || !phone || !otp || !gender){
        return res.status (400) .json({
            success:false,
            message:"All fields are mandatory"
        })
     }

         // Verify OTP
         const otpRecord = await otpmodel.findOne({ phone });
         if (!otpRecord || otpRecord.otp !== otp) {
             return res.status(400).json({
                 success: false,
                 message: "Invalid or expired OTP"
             });
         }

         const existinguser= await usermodel.findOne({  email  });
         if(existinguser){
            return res.status(422).json({
                success:false,
                message:"User already exists with this email"
            });
         }
const existingPhoneUser = await usermodel.findOne({ phone });
if (existingPhoneUser) {
    return res.status(422).json({
        success: false,
        message: "User already exists with this phone number"
    });
}

         
         

         // create user in  database
         const user= await usermodel.create({
            name,email,password, phone, gender
         });

         // Delete the OTP record once successfully registered
         await otpmodel.deleteOne({ phone });
         
         try {
             await emailservice(
                 user.email, 
                 "Registration Successful",
                 `Dear ${user.name},\n\nThank you for registering with our banking application. We are excited to have you on board!\n\nBest regards,\nThe Banking Team`
             );
         } catch (emailError) {
             console.error("Welcome email failed to send:", emailError);
         }

         const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "1d"});
        

          return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }).json({
            success:true,       
            message:"User registered successful",
            role: user.role || 'customer'
         }) 

    }

    catch(error){
        console.error("Error in signupcontroller", error);
        res.status(500).json({
            success:false,
            message: error.message || "Signup failed due to server error"
        });
    }

 }

 exports.login= async (req, res)=>{

try{

    const {email,password , phone} = req.body;
    if (!password || (!email && !phone)) {
        return res.status(400).json({
            success: false,
            message: "Please provide email/phone and password"
        });
     }
// select +password because in usermodel i have set select false for password field so it will not return password by default but i need it to compare the password so i have to select it explicitly
     const user= await usermodel.findOne(email ? { email } : { phone }).select("+password");
     if(!user){
        return res.status(400).json({
            success:false,
            message:"Kindly Signup first with this email/phone"
        })
     }
        const ismatch= await user.comparePassword(password);
        if(!ismatch){
            return res  .status(400).json({
                success:false,
                message:"Invalid credentials"
            })
        }
          
        

        const userlogin = await usermodel.findByIdAndUpdate(
            user._id, 
            {
                $set: { lastLogin: new Date() }
            }, 
            { returnDocument: 'after' }
        );

   

      
        const token = jwt.sign({id: user._id , role:user.role}, process.env.JWT_SECRET_KEY, {expiresIn: "1d"});
        return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }).json({
            success:true,       
            message:"Login successful",
            role: user.role || 'customer',
            userId: user._id

         })


         

        

}

catch(err){
    return res.status(500).json({
        success:false,
        message:"Login failed due to server error"
    })
}



 }



exports.logout= async (req, res)=>{
    try{
   let token = req.cookies?.token 


   if(!token){
    return res.status(400).json({
        success:false,
        message:"Error in Logout"
    })
   }
    res.clearCookie("token");
     await blacklistmodel.create({token});
  
    return res.status(200).json({
        success:true,
        message:"User logout Successfully"
    })
    }
    
    catch(err){

     return res.status(500).json({
        success:false,
        message:"Logout failed due to server error"
     })

    }
}  





 
// token verify controller
exports.tokenverify= async (req ,res)=>{
    try{
const token = req.cookies?.token || req.body?.token;
if (!token) {
    return res.status(401).json({
        success: false,
        message: "No token provided"
    });
}
// Check if the token is blacklisted
const blacklisted = await blacklistmodel.findOne({ token });
if (blacklisted) {
    return res.status(401).json({
        success: false,
        message: "Token is blacklisted. Please log in again."
    });
}
jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
    
    return res.status(200).json({
        success: true,
        message: "Token is valid",
        role: decoded.role || 'customer',
        userId: decoded.id
    });
}); 

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Token verification failed due to server error"
        })
    }
}

// get profile controller
exports.getProfile = async (req, res) => {
    try {
        const user = await usermodel.findById(req.user._id).select('+phone +date_of_birth +pan_id +adhar_id +address');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error("Error in getProfile", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user profile"
        });
    }
};