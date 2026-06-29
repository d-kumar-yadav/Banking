const usermodel=require("../models/user_model");
const loanmodel=require("../models/loan_model");
const referenceloanmodel=require("../models/reference_loan");
const accountmodel=require("../models/account_model");
const employee_model=require("../models/employe_model");
const { emailservice } = require("../service/email");
const { defaultprobablity } = require("../ml_service/loan_service");
const ledgermodel= require("../models/ledger");
const transactionmodel = require("../models/transaction");
const mongoose = require("mongoose");
const crypto = require("crypto");

exports.applyLoanController = async (req ,res) =>{
    try{
        const userId = req.user._id;
        const user = await usermodel.findById(userId).select('+creditScore +date_of_birth +monthlyIncome');

        if(!user){
            return res.status(404).json({message:"User not found"});
        }   
        const account = await accountmodel.findOne({ user:userId});

        if(!account){
            return res.status(404).json({message:"Account not found for user"});
        }   
        const { maritalStatus, educationLevel, employmentStatus, annualIncome, loanAmount, loanPurpose, loanTerm } = req.body;

        const birthYear = new Date(user.date_of_birth).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        const annualIncomeCalculated = user.monthlyIncome*12;     
        const debtToIncomeRatio = loanAmount / (annualIncomeCalculated);

        const newReferenceLoan = new referenceloanmodel({
            user: userId,
            age,
            gender: user.gender,
            monthlyIncome: user.monthlyIncome,
            totalCreditLimit: account.totalCreditLimit,   
            creditScoreAtApplication: user.creditScore,
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
         }; 
        
        // call ml servide
        const prob= await defaultprobablity(featuresforml);
        newReferenceLoan.defaultProbability = prob.defaultProbability;
            
        newReferenceLoan.status = "Review_Required";
        await newReferenceLoan.save();

        //send email to user about the application
        try{
            await emailservice(
                user.email,
                "Loan Application Received",
                `Dear ${user.name},\n\nYour loan application (Reference No: ${newReferenceLoan.reference_number}) has been received and is currently under review. We will notify you once the review process is complete.\n\nThank you for choosing our services.\n\nBest regards,\nBanking App Team`
            );  
        }
        catch(err){
            return res.status(500).json({message:"Failed to send email notification"});
        }

        return res.status(201).json({message:"Loan application submitted successfully", loanId: newReferenceLoan.reference_number});

    }catch(error){
        console.log("Error in applyLoanController:", error);
        res.status(500).json({message:"Internal server error "});
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

    const approvedLoans = await loanmodel.find({user:userId}).select("-defaultProbability -adminRemarks -__v -gender").populate("user").lean(); 
    const pendingLoans = await referenceloanmodel.find({user:userId}).select("-defaultProbability -adminRemarks -__v -gender").populate("user").lean();


  const combinedLoans = [
    // 1. For each pending loan...
    ...pendingLoans.map(l => ({
        ...l, // 2. Copy all of its original properties (like amount, status, etc.)
        loan_id: l.reference_number // 3. Add a NEW property called `loan_id` and give it the value of `reference_number`
    })),
    // 4. The approved loans already have a `loan_id`, so we can just add them directly.
    ...approvedLoans
];
// approved loan have specfic id callded loan id
// pending loan have specfic id called refrecne id
// the frontend component need to display a single,
//  unified list of all loans. To keep the code simple, 
// it expects every single loan object in the list to have a property called loan_id.

   
    combinedLoans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // it subract time stamp if postive means b crated first it should be above a and if neagtive a will be above b

    return res.status(200).json({
        success:true,
        message:"Loan history fetched successfully",
        loans: combinedLoans
    })  

 }catch(error){
    console.log("Error in loanhistorycontroler " , error);
    return res.status(500).json({
        success:false,
        message:"Internal server error in loan history controller ",
        error: error.message
    })
 }
}


// admin can see all the loan under review
exports.adminLoanReviewController= async (req, res) =>{
    try{
         const role = req.user.role 
         if(role !== "Manager" && role !== "Superadmin") {
             return res.status(403).json({
                success:false,
                message: "Unauthorized: Manager access required"
             })
        }
let query = {};
 
        
        if (role === "manager") {
            if (!req.user.branch) {
                return res.status(403).json({ success: false, message: "Manager does not have an assigned branch" });
            }
            const branchAccounts = await accountmodel.find({ branch: req.user.branch }).select('user');
            const branchUserIds = branchAccounts.map(acc => acc.user);
//    Loans do not have a branch field in their database model.

// Because we can't directly query loans by branch, my logic was trying to do a cross-reference:

// Find all bank accounts that belong to the manager's branch (const branchAccounts = await accountmodel.find(...))
// Extract the User IDs of the people who own those accounts (branchAccounts.map(acc => acc.user))
// Finally, fetch the loans that belong to those specific users (query.user = { $in: branchUserIds }

            query.user = { $in: branchUserIds };
        }

        let reviewloan = await referenceloanmodel.find(query).populate("user").lean();
        
       
        reviewloan = reviewloan.map(l => ({ ...l, loan_id: l.reference_number }));

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

        let query = {};
        
        if (role === "manager") {
            if (!req.user.branch) {
                return res.status(403).json({ success: false, message: "Manager does not have an assigned branch" });
            }
            const branchAccounts = await accountmodel.find({ branch: req.user.branch }).select('user');
            const branchUserIds = branchAccounts.map(acc => acc.user);
            query.user = { $in: branchUserIds };
        }

        const loans = await loanmodel.find(query).populate("user").sort({ createdAt: -1 });
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
        let loan;
        
        // Try looking in reference model first
        if (loan_id.startsWith("LREF-")) {
            loan = await referenceloanmodel.findOne({ reference_number: loan_id }).populate("user").lean();
            if (loan) loan.loan_id = loan.reference_number;
        } else {
            loan = await loanmodel.findOne({ loan_id }).populate("user").lean();
        }
        
        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        if (role === "manager") {
            if (!req.user.branch) {
                return res.status(403).json({ success: false, message: "Manager does not have an assigned branch" });
            }
            const account = await accountmodel.findOne({ user: loan.user._id });
            if (!account || account.branch.toString() !== req.user.branch.toString()) {
                return res.status(403).json({ success: false, message: "Access Denied: This loan belongs to a different branch." });
            }
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
exports.approveLoanController = async (req ,res)=>{
    try{
        const role = req.user.role ? req.user.role.toLowerCase() : "";
        if(role !== "manager" && role !== "superadmin") {
            return res.status(403).json({
                success:false,
                message:"Unauthorized: Manager access required"
            })
        }

        const { loan_id } = req.params;
        // Find from reference model
        const refLoan = await referenceloanmodel.findOne({ reference_number: loan_id }).populate("user");

        if (!refLoan) {
            return res.status(404).json({ success: false, message: "Loan application not found or already processed" });
        }       
        if (refLoan.status !== "Review_Required") {
            return res.status(400).json({ success: false, message: "Loan is not in review state" });
        }

        if (role === "manager") {
            if (!req.user.branch) {
                return res.status(403).json({ success: false, message: "Manager does not have an assigned branch" });
            }
            const account = await accountmodel.findOne({ user: refLoan.user._id });
            if (!account || account.branch.toString() !== req.user.branch.toString()) {
                return res.status(403).json({ success: false, message: "Access Denied: This loan belongs to a different branch." });
            }
        }

        // Calculate EMI Details
        const P = refLoan.loanAmount;
        const annualInterestRate = 0.10; // 10% Fixed
        const R = annualInterestRate / 12;
        const N = refLoan.loanTerm;
        const EMI = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        const totalRepaymentAmount = EMI * N;
        
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 30);

        // Move to main loan model
        const newLoan = new loanmodel({
            user: refLoan.user._id,
            age: refLoan.age,
            gender: refLoan.gender,
            monthlyIncome: refLoan.monthlyIncome,
            totalCreditLimit: refLoan.totalCreditLimit,
            creditScoreAtApplication: refLoan.creditScoreAtApplication,
            maritalStatus: refLoan.maritalStatus,
            educationLevel: refLoan.educationLevel,
            employmentStatus: refLoan.employmentStatus,
            annualIncome: refLoan.annualIncome,
            loanAmount: refLoan.loanAmount,
            loanPurpose: refLoan.loanPurpose,
            loanTerm: refLoan.loanTerm,
            debtToIncomeRatio: refLoan.debtToIncomeRatio,
            defaultProbability: refLoan.defaultProbability,
            status: "Active", // Directly active for prototype
            interestRate: annualInterestRate * 100,
            totalRepaymentAmount: totalRepaymentAmount,
            remainingBalance: totalRepaymentAmount,
            monthlyEMI: EMI,
            nextDueDate: nextDueDate
        });

        // Disburse Funds to user account
        const userAccount = await accountmodel.findOne({ user: refLoan.user._id });
        if (userAccount) {
            const disburseTx = await transactionmodel.create({
                fromaccount: "BANK-LOAN-DISBURSEMENT",
                toaccount: userAccount.accountNumber,
                amount: P,
                status: "Completed",
                idempotencykey: crypto.randomUUID()
            });

            await ledgermodel.create({
                account: userAccount.accountNumber,
                amount: P,
                type: "credit",
                transaction: disburseTx._id
            });
        }

        await newLoan.save();
        await referenceloanmodel.deleteOne({ _id: refLoan._id });


        try {
            await emailservice(
                refLoan.user.email,
                "Loan Application Approved",
                `Dear ${refLoan.user.name},\n\nCongratulations! Your loan application (Ref: ${refLoan.reference_number}) has been approved and assigned Loan ID: ${newLoan.loan_id}. We will contact you shortly to discuss the next steps for disbursement.\n\nThank you for choosing our services.\n\nBest regards,\nBanking App Team`
            );
        } catch (e) {
            console.error("Email send failed during loan approval");
        }
        
        return res.status(200).json({
            success: true,
            message: "Loan approved successfully",
            loanId: newLoan.loan_id
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
exports.rejectLoanController = async (req ,res)=>{
    try{
        const role = req.user.role ? req.user.role.toLowerCase() : "";
        if(role !== "manager" && role !== "superadmin") {
            return res.status(403).json({
                success:false,
                message:"Unauthorized: Manager access required"
            })
        }

        const { loan_id } = req.params;
        const refLoan = await referenceloanmodel.findOne({ reference_number: loan_id }).populate("user");

        if (!refLoan) {
            return res.status(404).json({ success: false, message: "Loan application not found or already processed" });
        }       
        if (refLoan.status !== "Review_Required") {
            return res.status(400).json({ success: false, message: "Loan is not in review state" });
        }

        if (role === "manager") {
            if (!req.user.branch) {
                return res.status(403).json({ success: false, message: "Manager does not have an assigned branch" });
            }
            const account = await accountmodel.findOne({ user: refLoan.user._id });
            if (!account || account.branch.toString() !== req.user.branch.toString()) {
                return res.status(403).json({ success: false, message: "Access Denied: This loan belongs to a different branch." });
            }
        }

    
        await referenceloanmodel.deleteOne({ _id: refLoan._id });


        try {
            await emailservice(
                refLoan.user.email,
                "Loan Application Rejected",
                `Dear ${refLoan.user.name},\n\nWe regret to inform you that your loan application (Ref: ${refLoan.reference_number}) has been rejected. If you have any questions, please feel free to contact us.\n\nThank you for considering our services.\n\nBest regards,\nBanking App Team`
            );
        } catch (e) {
            console.error("Email send failed during loan rejection");
        }
        
        return res.status(200).json({
            success: true,
            message: "Loan rejected successfully"
        }); 
        
    }catch(error){
        console.log("Error in reject LoanController " , error);
        return res.status(500).json({
            success:false,
            message:"Internal server error in reject loan controller"
        })
    }
}

// repay loan EMI
exports.repayLoanController = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const userId = req.user._id;
        const { loan_id, account_number } = req.body;

        const loan = await loanmodel.findOne({ loan_id, user: userId }).session(session);
        if (!loan) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Loan not found" });
        }
        
        if (loan.status !== "Active") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: `Cannot repay a loan that is ${loan.status}` });
        }

        const account = await accountmodel.findOne({ accountNumber: account_number, user: userId });
        if (!account || account.status !== "Active") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid or inactive account" });
        }

        const balance = await account.getbalance();
        const emiAmount = loan.monthlyEMI;

        if (balance < emiAmount) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: `Insufficient balance. EMI is ₹${emiAmount.toFixed(2)}` });
        }

        // Create a transaction record first
        const repayTx = await transactionmodel.create([{
            fromaccount: account.accountNumber,
            toaccount: "BANK-LOAN-REPAYMENT",
            amount: emiAmount,
            status: "Completed",
            idempotencykey: crypto.randomUUID()
        }], { session });

        // Deduct from user account
        await ledgermodel.create([{
            account: account.accountNumber,
            amount: emiAmount,
            type: "debit",
            transaction: repayTx[0]._id
        }], { session });

        // Update Loan Balance
        loan.remainingBalance -= emiAmount;
        if (loan.remainingBalance <= 0) {
            loan.remainingBalance = 0;
            loan.status = "Closed";
        } else {
            // Push next due date forward by 30 days
            const nextDue = new Date(loan.nextDueDate);
            nextDue.setDate(nextDue.getDate() + 30);
            loan.nextDueDate = nextDue;
        }

        await loan.save({ session });
        
        // Gamification: Increase Credit Score by 1.5
        const user = await usermodel.findById(userId).select("+creditScore").session(session);
        let creditGained = 0;
        let newScore = user.creditScore;
        if (user && user.creditScore < 950) {
            newScore = Math.min(950, user.creditScore + 1.5);
            creditGained = newScore - user.creditScore;
            user.creditScore = newScore;
            await user.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ 
            success: true, 
            message: `EMI Repaid successfully. ${creditGained > 0 ? `Credit Score +${creditGained.toFixed(1)} 🌟` : ''}`,
            remainingBalance: loan.remainingBalance,
            status: loan.status,
            creditScoreGained: creditGained,
            newCreditScore: newScore
        });

    } catch (error) {
        await session.abortTransaction();
        console.log("Error in repayLoanController ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error in repay loan controller"
        });
    } finally {
        session.endSession();
    }
};

// preclose loan completely
exports.precloseLoanController = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const userId = req.user._id;
        const { loan_id, account_number } = req.body;

        const loan = await loanmodel.findOne({ loan_id, user: userId }).session(session);
        if (!loan) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Loan not found" });
        }
        
        if (loan.status !== "Active") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: `Cannot preclose a loan that is ${loan.status}` });
        }

        const account = await accountmodel.findOne({ accountNumber: account_number, user: userId });
        if (!account || account.status !== "Active") {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Invalid or inactive account" });
        }

        const balance = await account.getbalance();
        const closeAmount = loan.remainingBalance;

        if (balance < closeAmount) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: `Insufficient balance. Foreclosure amount is ₹${closeAmount.toFixed(2)}` });
        }

        // Create a transaction record first
        const closeTx = await transactionmodel.create([{
            fromaccount: account.accountNumber,
            toaccount: "BANK-LOAN-FORECLOSURE",
            amount: closeAmount,
            status: "Completed",
            idempotencykey: crypto.randomUUID()
        }], { session });

        // Deduct from user account
        await ledgermodel.create([{
            account: account.accountNumber,
            amount: closeAmount,
            type: "debit",
            transaction: closeTx[0]._id
        }], { session });

        // Update Loan Balance
        loan.remainingBalance = 0;
        loan.status = "Closed";

        await loan.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ 
            success: true, 
            message: `Loan successfully foreclosed! Paid ₹${closeAmount.toLocaleString(undefined, {maximumFractionDigits:2})}.`,
            remainingBalance: loan.remainingBalance,
            status: loan.status
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in precloseLoanController:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

