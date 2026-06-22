const usermodel=require("../models/user_model");
const loanmodel=require("../models/loan_model");
const accountmodel=require("../models/account_model");
const { emailservice } = require("../service/email");
const { defaultprobablity } = require("../ml_service/loan_service");

exports.applyLoanController = async (req ,res) =>{
    try{
      
        const userId = req.user._id;
        const user = await usermodel.findById(userId).select('+creditScore +date_of_birth +monthlyIncome');

        if(!user){
            return res.status(404).json({message:"User not found"});
        }   
        const account = await accountmodel.findOne({ user: userId });

        if(!account){
            return res.status(404).json({message:"Account not found for user"});
        }   
        const { maritalStatus, educationLevel, employmentStatus, annualIncome, loanAmount, loanPurpose, loanTerm } = req.body;

        const birthYear = new Date(user.date_of_birth).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        const annualIncomeCalculated = user.monthlyIncome*12;     
        const debtToIncomeRatio = loanAmount / (annualIncomeCalculated);

        const newLoan = new loanmodel({
            user: userId,
            age,
            gender: user.gender,
            monthlyIncome: user.monthlyIncome,
            totalCreditLimit: account.totalCreditLimit,   
            creditScoreAtApplication: user.creditScore ,
            maritalStatus,
            educationLevel,     
            employmentStatus,
            annualIncome,
            loanAmount, 
            loanPurpose,
            loanTerm,
            debtToIncomeRatio
        });

    
      

        const featuresforml ={
            age ,
            gender: user.gender,
            marital_status: maritalStatus,
            education_level:  educationLevel,
            annual_income: annualIncome,
            monthly_income: user.monthlyIncome,
            employment_status: employmentStatus,
            debt_to_income_ratio: debtToIncomeRatio,    
            credit_score: user.creditScore,
            loan_amount: loanAmount,
            loan_purpose: loanPurpose,
            total_credit_limit: account.totalCreditLimit
         } ; 
        
          // call ml servide
          const prob= await  defaultprobablity(featuresforml);
          newLoan.defaultProbability= prob.defaultProbability;
            
        newLoan.status = "Review_Required";
        await newLoan.save();

        //send email to user about the application
        await emailservice(
            user.email,
            "Loan Application Received",
            `Dear ${user.name},\n\nYour loan application (ID: ${newLoan.loan_id}) has been received and is currently under review. We will notify you once the review process is complete.\n\nThank you for choosing our services.\n\nBest regards,\nBanking App Team`
        );  


        return res.status(201).json({message:"Loan application submitted successfully", loanId: newLoan.loan_id});



    }catch(error){
        console.log("Error in applyLoanController:", error);
        res.status(500).json({message:"Internal server error in applyLoanController"});
    }
}


// loan history controller , to get all the loan applied by the user

exports.loanHistoryController= async (req, res) =>{
 try{

const userId= req.user._id;
   const user=await usermodel.findById(userId);

   if(!user){
    return res.status(404).json({message:"User not found"});
   }

   const loans= await loanmodel.find({user:userId}).select("-defaultProbability -adminRemarks +user -__v -gender"); // Exclude sensitive ML and Admin fields

    return res.status(200).json({
        success:true,
        message:"Loan history fetched successfully",
        loans
    })  


 }catch(error){
    console.log("Error in loanhistorycontroler " , error);
    return res.status(500).json({
        success:false,
        message:"Internal server error in loan history controller"
    })
 }

}


// admin can see all the loan under review
exports.adminLoanReviewController= async (req, res) =>{
    try{
        
         const role = req.user.role ? req.user.role.toLowerCase() : "";
         if(role !== "manager" && role !== "superadmin") {
             return res.status(403).json({
                success:false,
                message: "Unauthorized: Manager access required"
             })
        }

        const reviewloan= await loanmodel.find({status:"Review_Required"}).populate("user");
        return res.status(200).json({
            success:true,
            message:"Loans under review fetched successfully",
            reviewloan
        })
    }catch(error){
        console.log("Error in adminLoanReviewController " , error);
        return res.status(500).json({
            success:false,
            message:"Internal server error in admin loan review controller"
        })
    }
}

// Admin can get all loans (regardless of status)
exports.getAllLoansController = async (req, res) => {
    try {
        const role = req.user.role ? req.user.role.toLowerCase() : "";
        if (role !== "manager" && role !== "superadmin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Manager access required"
            });
        }

        const loans = await loanmodel.find().populate("user").sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "All loans fetched successfully",
            loans
        });
    } catch (error) {
        console.log("Error in getAllLoansController ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error in get all loans controller"
        });
    }
};


// Admin can get details of a specific loan by its loan_id
exports.getLoanDetailsController = async (req, res) => {
    try {
        const role = req.user.role ? req.user.role.toLowerCase() : "";
        if (role !== "manager" && role !== "superadmin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Manager access required"
            });
        }

        const { loan_id } = req.params;
        const loan = await loanmodel.findOne({ loan_id }).populate("user");
        
        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Loan details fetched successfully",
            loan
        });
    } catch (error) {
        console.log("Error in getLoanDetailsController ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error in get loan details controller"
        });
    }
};

// approve loan 
exports.approveLoanController= async (req ,res)=>{
    try{
           const role = req.user.role ? req.user.role.toLowerCase() : "";
           if(role !== "manager" && role !== "superadmin") {
            return res.status(403).json({
                success:false,
                message:"Unauthorized: Manager access required"
            })
        }

        const { loan_id } = req.params;
        const loan = await loanmodel.findOne({ loan_id }).populate("user");

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }       
        if (loan.status !== "Review_Required") {
            return res.status(400).json({ success: false, message: "Loan is not in review state" });
        }

        loan.status = "Approved";
        await loan.save();

        // Send email to user about approval
        await emailservice(
            loan.user.email,
            "Loan Application Approved",
            `Dear ${loan.user.name},\n\nCongratulations! Your loan application (ID: ${loan.loan_id}) has been approved. We will contact you shortly to discuss the next steps for disbursement.\n\nThank you for choosing our services.\n\nBest regards,\nBanking App Team`
        );
        return res.status(200).json({
            success: true,
            message: "Loan approved successfully"
        }); 

    }catch(error){
        console.log("Error in approveLoanController " , error);
        return res.status(500).json({
            success:false,
            message:"Internal server error in approve loan controller"
        })
    }
}


// reject loan
exports.rejectLoanController= async (req ,res)=>{
    try{
           const role = req.user.role ? req.user.role.toLowerCase() : "";
           if(role !== "manager" && role !== "superadmin") {
            return res.status(403).json({
                success:false,
                message:"Unauthorized: Manager access required"
            })
        }

        const { loan_id } = req.params;
        const loan = await loanmodel.findOne({ loan_id }).populate("user");

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }       
        if (loan.status !== "Review_Required") {
            return res.status(400).json({ success: false, message: "Loan is not in review state" });
        }

        loan.status = "Rejected";
        await loan.save();

        // Send email to user about rejection
        await emailservice(
            loan.user.email,
            "Loan Application Rejected",
            `Dear ${loan.user.name},\n\nWe regret to inform you that your loan application (ID: ${loan.loan_id}) has been rejected. If you have any questions, please feel free to contact us.\n\nThank you for considering  our services.\n\nBest regards,\nBanking App Team`
        );
        return res.status(200).json({
            success: true,
            message: "Loan rejected successfully"
        }); 
        
    }catch(error){
        console.log("Error in reject  LoanController " , error);
        return res.status(500).json({
            success:false,
            message:"Internal server error in reject loan controller"
        })
    }
}
