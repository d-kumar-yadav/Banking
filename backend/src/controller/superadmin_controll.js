const express= require("express")
const usermodel = require("../models/user_model");
const branchmodel = require("../models/branch_model");
const blacklistmodel = require("../models/blacklist_model");
const jwt = require("jsonwebtoken");
const emailservice = require("../utils/email_service");
const managerModel = require("../models/manager");
const transactionmodel = require("../models/transaction");
const ledgermodel = require("../models/ledger");
const mongoose = require("mongoose");

// for register

exports.register= async(req,res) =>{

 try{
  const { email,name, password  }= req.body;
  
     if(!email || !name || !password ){
        return res.status (400) .json({
            success:false,
            message:"All fields are mandatory"
        })
     }

         const existinguser= await usermodel.findOne({  email  });
         if(existinguser){
            return res.status(422).json({
                success:false,
                message:"User already exists with this email"
            });
         }

         // create user in  database
         const user= await usermodel.create({
            name,email,password, role:"superadmin"
         });

     
         
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
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
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

// for login
 exports.login= async (req, res)=>{

try{

    const {email,password } = req.body;
    if (!password || !email ) {
        return res.status(400).json({
            success: false,
            message: "Please provide both credential"
        });
     }
// select +password because in usermodel i have set select false for password field so it will not return password by default but i need it to compare the password so i have to select it explicitly
     const user= await usermodel.findOne({email}).select("+password");
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
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }).json({
            success:true,       
            message:"Login successful",
            role: user.role || 'customer'
         })


         

        

}

catch(err){
    return res.status(500).json({
        success:false,
        message:"Login failed due to server error"
    })
}



 }

 // for logout
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


// for create branch
exports.createBranch =async (req ,res) =>{
  const {branchName , branchPhone , branchEmail ,address} = req.body;

    const user= req.user; // Access the authenticated user from the request object;

    if(user.role !== "superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    } 
    
    
    try{
     
        const newBranch = await branchmodel.create({
            branchName,
            branchPhone,
            branchEmail,
            address,
            status:"Active"


        }); 
        return res.status(201).json({
            success:true,
            message:"Branch created successfully",
            branch: newBranch
        })



    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to create branch due to server error"
        })
    }
}

// for getAllBranches ,
 exports.getAllBranches = async(req ,res)=>{

    const user=req.user;
    if(user.role !== "superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
    try{
        const branches = await branchmodel.find();
        return res.status(200).json({
            success:true,
            message:"Branches retrieved successfully",
            branches
        })
    }   
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to retrieve branches due to server error"
        })
    }



 }

 // get branch by id
exports.getBranchById = async(req ,res) =>{

    const user=req.user;    
    if(user.role !== "superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
    const {id} = req.params;
    try{
        const branch = await branchmodel.findById(id);  
        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }   
        const manager = await managerModel.findOne({ branch: branch._id });
        return res.status(200).json({
            success:true,
            message:"Branch retrieved successfully",
            branch,
            manager
        })
    }       
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to retrieve branch due to server error"
        })
    }
    
}

// update branch
exports.updateBranch = async(req ,res) =>{
    const user=req.user;
    if(user.role !== "superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
    const {id} = req.params;
    const {branchName , branchPhone , branchEmail ,address} = req.body;
    try{
        const branch = await branchmodel.findById(id);

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }
        branch.branchName = branchName || branch.branchName;
        branch.branchPhone = branchPhone || branch.branchPhone;
        branch.branchEmail = branchEmail || branch.branchEmail;
        branch.address = address || branch.address;
        await branch.save();
        return res.status(200).json({
            success:true,

            message:"Branch updated successfully",
            branch
        })
    }       
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to update branch due to server error"
        })
    }       
}

// delete branch

exports.deleteBranch = async(req ,res) =>{
    const user=req.user;
    if(user.role !== "superadmin"){ 
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
    const {id} = req.params;
        
    try{
        const branch = await branchmodel.findById(id);
        if(!branch){
            return res.status(404).json({   
                success:false,
                message:"Branch not found"
            })
        }       
        await branch.deleteOne();
        return res.status(200).json({
            success:true,
            message:"Branch deleted successfully"
        })
    }   
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to delete branch due to server error"
        })
    }
}

// allocate funds
exports.allocate_funds = async(req,res)=>{

    try {
        const { accountNumber, amount, idempotencykey } = req.body;

        // step 1: validate the request body
        if(!accountNumber || !amount || !idempotencykey){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }       

            const branch = await branchmodel.findOne({branchAccount: accountNumber})
            if(!branch){
                return res.status(404).json({  
                    success:false,
                    message:"Branch account not found"
                })
            }
             if(branch.status !== "Active"){
                return res.status(400).json({
                    success:false,
                    message:"Branch is not active"
                })
            }

       
        // step 2: check for idempotency key to avoid duplicate transactions
        const existtransaction= await transactionmodel.findOne({idempotencykey}); 
        
        if(existtransaction){
            if(existtransaction.status === "Completed"){
                return res.status(200).json({
                    success:true,
                    message:"Transaction already completed successfully (Idempotent retry)",
                    transactionId: existtransaction._id
                })
            }
            else if(existtransaction.status === "Pending" || existtransaction.status === "Processing_External"){
                return res.status(400).json({
                    success:false,
                    message:"Transaction with this idempotency key is already in progress"
                })
            }
            else if(existtransaction.status === "Failed"){
                return res.status(400).json({
                    success:false,
                    message:"Transaction with this idempotency key has already failed ,retry again"
                })
            }
            else if(existtransaction.status === "Reversed"){ 
                return res.status(400).json({
                    success:false,
                    message:"Transaction with this idempotency key has already been reversed , retry again"
                })
            }
        }

      
        const session= await mongoose.startSession();
        // create session
        session.startTransaction();
        // initiates the transaction on that session. like updates , delete ,insert

        let transaction; // Declare here so it's accessible after try block

        try {  // you are temporarily storing this transaction object in your server's RAM (Node.js memory). 
            transaction= new transactionmodel({
                fromaccount: "CENTRAL_VAULT" , // Central account identifier
                toaccount: accountNumber, 
                amount: Number(amount),
                idempotencykey,
                status: "Pending"
            } ) 

            // step -6
            const debitledgerentry= await ledgermodel.create([{
                account: "CENTRAL_VAULT" , // Central account identifier
                amount: Number(amount),
                transaction:transaction._id,
                type:"debit"
            }] , {session}) 

           
         const creditledgerentry= await ledgermodel.create([{
                    account: accountNumber , // Branch account identifier
                    amount: Number(amount),
                    transaction:transaction._id,
                    type:"credit"
                }] , {session})
  
            transaction.status = "Completed";
            await transaction.save({session});
          
            await session.commitTransaction();

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            // step -9
            session.endSession();
        }
  
 
        return res.status(200).json({
            success: true,
            message: "Transaction completed successfully",
            transactionId: transaction._id
        });

    } catch(err){
        console.error("Error in transaction controller", err);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}



// branch tanx
exports.branch_tranx = async(req,res) =>{
    const user=req.user;
    if(user.role !== "superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
    const {accountNumber} = req.params;
    try{
        const transactions= await transactionmodel.find({
            $or:[
                {fromaccount: accountNumber},
                {toaccount: accountNumber}
            ]
        }).sort({createdAt: -1});
        return res.status(200).json({
            success:true,
            message:"Transactions retrieved successfully",
            transactions
        })  

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to retrieve transactions due to server error"
        })
    }
}