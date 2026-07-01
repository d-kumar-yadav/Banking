const express= require("express")
const usermodel = require("../models/user_model");
const branchmodel = require("../models/branch_model");
const blacklistmodel = require("../models/blacklist");
const jwt = require("jsonwebtoken");
const emailservice = require("../service/email");
const employeeModel = require("../models/employe_model");
const transactionmodel = require("../models/transaction");
const ledgermodel = require("../models/ledger");
const mongoose = require("mongoose");


// for login
 exports.login= async (req, res)=>{

try{
    console.log("login me aya")

    const {email,password } = req.body;
    if (!password || !email ) {
        return res.status(400).json({
            success: false,
            message: "Please provide both credential"
        });
     }
// select +password because in usermodel i have set select false for password field so it will not return password by default but i need it to compare the password so i have to select it explicitly
     const user= await employeeModel.findOne({email}).select("+password");
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
          
        

        const userlogin = await employeeModel.findByIdAndUpdate(
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
            role: user.role 
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
  console.log("createBranch called with body:", req.body);

    const user= req.user; 

    if(user.role !== "Superadmin"){
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
        console.error("Error in createBranch:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `Branch with this ${field} already exists.`
            });
        }
        return res.status(500).json({
            success:false,
            message:"Failed to create branch due to server error"
        })
    }
}

// for getAllBranches ,
 exports.getAllBranches = async(req ,res)=>{

    const user=req.user;
    if(user.role !== "Superadmin"){
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
    if(user.role !== "Superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
    const {id} = req.params;
    try{
        let  branch = await branchmodel.findOne({ branchCode: id });
        
        
        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }   
        else return res.status(200).json({
            success:true,
            message:"Branch retrieved successfully",
            branch
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
    if(user.role !== "Superadmin"){
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
    if(user.role !== "Superadmin"){ 
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
    if(user.role !== "Superadmin"){
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

// add employee/manger 
exports.add_employee = async (req ,res) =>{
   const {name , email  , password ,phone , role}= req.body; 
   const user=req.user;

if(user.role !== "Superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }

    const newemployee= await employeeModel.create({
        name,
        email,
        password,
        phone,
        role,   
    })

    return res.status(201).json({
        success:true,
        message:"Employee created successfully",
        employee: newemployee
    })


}

// add employee/manager to branch
exports.add_to_branch = async (req,res)=>{
    const {branchid , employeeid} = req.body;
    const user=req.user;    
    if(user.role !== "Superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }

    const branch = await branchmodel.findById(branchid);
    if(!branch){
        return res.status(404).json({
            success:false,
            message:"Branch not found"
        })
        
    }
    const employee = await employeeModel.findById(employeeid);
    if(!employee){
        return res.status(404).json({
            success:false,
            message:"Employee not found"
        })
    }
    employee.branch = branch;
    branch.employee = employee; 
    await branch.save();
    await employee.save();

    return res.status(200).json({
        success: true,
        message: "Successfully assigned to branch"
    });
}

// get all employees
exports.getAllEmployees = async (req, res) => {
    const user = req.user;
    if (user.role !== "Superadmin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden access. Super Admin only."
        });
    }
    try {
        const employees = await employeeModel.find().select("-password").populate("branch");
        return res.status(200).json({
            success: true,
            message: "Employees retrieved successfully",
            employees
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve employees due to server error"
        });
    }
};

// get employee by id
exports.getEmployeeById = async (req, res) => {
    const {id}= req.params;
        const user= req.user;
       if(user.role !== "Superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
    const mongoose = require("mongoose");
    let  employee = await employeeModel.findOne({ employeeId: id }).select("-password").populate("branch");
    

    if(!employee){
        return res.status(404).json({
            success:false,
            message:"Employee not found"
        })
    }
    return res.status(200).json({   
        success:true,
        message:"Employee retrieved successfully",
        employee
    })  
}

// update emplouee
exports.updateEmployee = async (req,res) =>{
    const {id} = req.params;
    const {name , email , phone , role , branchid} = req.body;
    const user= req.user;
    if(user.role !== "Superadmin"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Super Admin only."
        })
    }
     const employee= await employeeModel.findById(id).select("-password")
    if(!employee){
        return res.status(404).json({
            success:false,
            message:"Employee not found"
        })
    }
    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.role = role || employee.role;
    employee.branch = branchid || employee.branch;
    await employee.save();
    return res.status(200).json({  
        success:true,
        message:"Employee updated successfully",
        employee
    })
}

// delete employee
exports.deleteEmployee = async (req,res) =>{
    const {id} = req.params;
    const user= req.user;
    if(user.role !== "Superadmin"){
        return res.status(403).json({
            success:false,  
            message:"Forbidden access. Super Admin only."
        })
    }
    const employee= await employeeModel.findById(id);
    if(!employee){
        return res.status(404).json({
            success:false,
            message:"Employee not found"
        })
    }
    await employee.deleteOne();
    return res.status(200).json({
        success:true,
        message:"Employee deleted successfully"
    })
}        

// Get own employee info
exports.getMe = async (req, res) => {
    try {
        const employee = await employeeModel.findById(req.user._id).select("-password +phone").populate("branch");
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
       
        return res.status(200).json({
            success: true,
            employee,
            
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve employee data"
        });
    }
}

// Update employee password
exports.updateEmployeePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both current and new passwords"
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        const employee = await employeeModel.findById(req.user._id).select("+password");
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const isMatch = await employee.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid current password" });
        }

        employee.password = newPassword;
        await employee.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (err) {
        console.error("Error in updateEmployeePassword:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to update password due to server error"
        });
    }
}

// get branch balance
exports.branchbalane = async(req ,res) =>{
    try {
        const user = req.user;
        if(user.role !== "Manager") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access. Manager only."
            });
        }
        
        const branch = await branchmodel.findById(user.branch);
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found for this manager"
            });
        }

        const balance = await branch.getbalance();
        
        return res.status(200).json({
            success: true,
            branchBalance: balance
        });
    } catch (error) {
        console.error("Error in branchbalance:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch branch balance"
        });
    }
}




// intial fund
exports.intialfundcontroller =async (req,res)=>{
    const user= req.user;
    if(user.role!="Manager"){
        return res.status(403).json({
            success:false,
            message:"Forbidden access. Manager only."   
    })
    }

    try{
 const{toaccount,amount, idempotencykey}= req.body;
 if(!toaccount || !amount || !idempotencykey){  
         return res.status(400).json({
            success:false,
            message:"All fields are required"
         })
         
 }
 

  // Check for idempotency key to gracefully avoid duplicate transaction errors
  const existtransaction = await transactionmodel.findOne({idempotencykey}); 
  if(existtransaction){
      if(existtransaction.status === "Completed"){
          return res.status(200).json({
              success:true,
              message:"Initial fund already added successfully (Idempotent retry)",
              transactionId: existtransaction._id
          })
      }

      else if(existtransaction.status === "Pending"){
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

  const branch = await branchmodel.findById(req.user.branch);
  if (!branch) {
      return res.status(404).json({
          success: false,
          message: "Branch not found for this manager"
      });
  }
  const fromaccount = branch.branchAccount;


  // create session
   const session= await mongoose.startSession();
        // create session
        session.startTransaction();
        // initiates the transaction on that session. like updates , delete ,insert

        let transaction; // Declare here so it's accessible after try block

        try {
            // Check branch balance before initiating transaction using the branch document directly
            const currentBranchBalance = await branch.getbalance();
            
            if (currentBranchBalance < amount) {
                // Abort session because we already started it
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ success: false, message: "Insufficient Funds in Branch Account" });
            }

            transaction= new transactionmodel({
                
                fromaccount: fromaccount,
                toaccount: toaccount,
                amount,
                idempotencykey,
                status:"Pending"
            }  )
            const debitledgerentry= await ledgermodel.create([{
                account: fromaccount,
                amount:amount,
                transaction:transaction._id,
                type:"debit"
            } ], {session}) 

         
            const creditledgerentry= await ledgermodel.create([{
                account: toaccount,
                amount:amount,
                transaction:transaction._id,
                type:"credit"
            }] , {session})

            
            transaction.status= "Completed";
            await transaction.save({session});
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            
            session.endSession();
        }

        // Send the successful response so the client doesn't hang!
        return res.status(200).json({
            success: true,
            message: "Initial fund added successfully",
            transactionId: transaction._id
        });
    }

   catch(err){
        console.error("Error in intial fund  controller", err);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }

}

