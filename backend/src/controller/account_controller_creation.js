const accountmodel = require("../models/account_model");
const usermodel = require("../models/user_model");

const crypto = require("crypto");
require("dotenv").config();
const { emailservice } = require("../service/email");
const otpmodel = require("../models/otp_model");
const { sendSMS } = require("../service/sms");
const transactionmodel = require("../models/transaction");
const refernceaccountmodel = require("../models/refernce_account");
const Branch = require("../models/branch_model");

//  for account creation
exports.createaccount = async (req, res) => {



    try {

        const userId = req.user._id;
        const { pan_image, adhar_image, signature, image, address, pan_id, adhar_id, otp, account_type, branchCode } = req.body;

        if (!pan_image || !adhar_image || !signature || !image || !address || !pan_id || !adhar_id || !otp || !account_type || !branchCode) {
            return res.status(400).json({
                success: false,
                message: "All account details, account type, branch code, and OTP are required"
            });
        }

        // each user can create account with unique phone number
        const existingAccount = await accountmodel.findOne({ user: userId });
        const existingphone = await usermodel.findOne({ phone: req.user.phone });
        if (existingphone && existingAccount.account_type==account_type) {
            return res.status(400).json({
                success: false,
                message: "An account already exists for this phone number please use another phone number"
            })
        }

        if (existingAccount && existingAccount. account_type === account_type) {
            return res.status(400).json({
                success: false,
                message: "An account already exists for this user"
            });
        }

        const checkUser = await usermodel.findById(userId).select("+phone");
        if (!checkUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otpRecord = await otpmodel.findOne({ phone: checkUser.phone });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        const branch = await Branch.findOne({ branchCode: branchCode });
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: "Branch not found for the provided Branch Code"
            });
        }

        const refernceaccount = await refernceaccountmodel.create({ user: userId, account_type, branchCode: branch._id });

        const user = await usermodel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    pan_image,
                    adhar_image,
                    signature,
                    image,
                    address,
                    pan_id,
                    adhar_id
                    // kycStatus remains 'pending' (default) until admin approves
                }
            },
            { returnDocument: 'after', runValidators: true } // Returns updated user & runs regex matching on PAN/Aadhaar 
            // returnDocument: 'after'  return updated object
            // runvalidatoor: it check schema validation like 
        )

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete the OTP record after successful registration
        await otpmodel.deleteOne({ phone: checkUser.phone });

        // Send email notification for account creation request
        try {
            await emailservice(
                req.user.email,
                "Account Creation Request Received",
                `Hello ${req.user.name},\n\nYour account creation request has been submitted successfully and is currently under review. Please wait for admin approval.`
            );
        } catch (emailErr) {
            console.error("Email notification failed:", emailErr);
        }



        return res.status(201).json({
            success: true,
            message: "Account created successfully , and it is under Review , please wait for approval",


        })


    }

    catch (err) {
        console.error("Error in createaccount controller", err);

        // Handle Duplicate entry error specifically (e.g. Aadhaar or PAN is already used by another user)
        if (err.code === 11000 ) {
            return res.status(400).json({
                success: false,
                message: " An Account already exists for this Adhar_id and Pan_id "
            });
        }

        return res.status(500).json({
            success: false,
            message: err.message || "Account creation failed due to server error"
        })
    }

}

// get all account user applied ans has status is pending for approval by admin
exports.getappliedaccounts = async (req, res) => {
    try {

        const appliedaccounts = await refernceaccountmodel.find({ user: req.user._id }).populate("user", "+pan_id +adhar_id +phone +address");
        return res.status(200).json({
            success: true,
            message: "Applied accounts fetched successfully",
            appliedaccounts // The frontend will receive this as a JSON array
        })



    }
    catch (err) {
        console.error("Error in getappliedaccounts controller", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch applied accounts due to server error"
        })
    }
}


// get all the account of the user 
exports.getallaccount = async (req, res) => {

    try {

        const accounts = await accountmodel.find({ user: req.user._id })

        return res.status(200).json({
            success: true,
            message: "Accounts fetched successfully",
            accounts // The frontend will receive this as a JSON array
        })
    }
    catch (err) {
        console.error("Error in getallaccount:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch accounts"
        })
    }


}


// get user balance
exports.getbalance = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const account = await accountmodel.findOne({
            accountNumber: accountNumber,
            user: req.user._id
        });

        // account type is document object
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        const balance = await account.getbalance();
        return res.status(200).json({
            success: true,
            message: "Balance fetched successfully",
            balance
        });
    } catch (err) {
        console.error("Error in getbalance controller:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}







// Manager  CONTROLLERS FOR ACCOUNTS






// approve frozen account by Manager 

exports.approvefrozenaccount = async (req, res) => {

    try {
        if (req.user.role != "Manager" && req.user.role != "Superadmin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Admin access required"
            })
        }

        const { accountNumber , branchCode } = req.body;
        
//  here we  find all account with frozen statue  but we cannot unfreeze every account means thta account may belong to dofffent branch 
//  so unfreeze that account which is related to that branch which manager is managing


        const account = await accountmodel.findOne({ accountNumber: accountNumber, status: "Frozen" , branchCode: branchCode }).populate("user");
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }



        const updateaccount = await accountmodel.findOneAndUpdate(
            { accountNumber: accountNumber, status: "Frozen" },
            { status: "Active" },
            { returnDocument: "after" }
        );


        await emailservice(
            account.user.email,
            "Account Unfrozen",
            `Hello  
                <h4 style="color: #333;"    >${account.user.name}</h4>,
                <p>Your account with Account Number 
               <h3 style="color: #555050;">${account.accountNumber}</h3> 
                has been unfrozen and is now active. You can resume your transactions.</p>`
        );

        return res.status(200).json({
            success: true,
            message: "Account has been approved and unfrozen successfully",

        })


    } catch (err) {
        console.error("Error in approvefrozenaccount:", err);
        return res.status(500).json({
            success: false,
            message: "failed to approve frozen account due to server error"
        })
    }




}

// Manager: Approve account creation request
exports.approveAccount = async (req, res) => {
    try {
        if (req.user.role !== 'Manager' && req.user.role !== 'Superadmin') {
            return res.status(403).json({ success: false, message: "Unauthorized: Manager or Superadmin access required" });
        }

        const { userId, refrencenumber } = req.params; // The user whose account to be  approved

        const user = await usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }




        const existingAccount = await accountmodel.findOne({ user: userId });
        if (existingAccount) {
            return res.status(400).json({ success: false, message: "Account already exists for this user" });
        }

        const refAccount = await refernceaccountmodel.findOne({ refrencenumber: refrencenumber });
        if (!refAccount) {
            return res.status(404).json({ success: false, message: "Reference account not found" });
        }

        // 1. Update user KYC status to verified
        user.kycStatus = "verified";

        await user.save();

        // 2. Create the active account now that admin has approved
        const account = await accountmodel.create({
            user: userId,
            account_type: refAccount.account_type,
            status: "Active",
            branchCode: refAccount.branchCode
        });

        await account.populate("user");
        // delete that ref associated with this user
        await refernceaccountmodel.deleteOne({ refrencenumber: refrencenumber });

        // Send email notification for successful account creation/approval
        try {
            await emailservice(
                user.email,
                "Account Approved and Created",
                `Hello ${user.name},\n\nCongratulations! Your account has been approved and created successfully.\n\nYour new Account Number is: ${account.accountNumber}`
            );
        } catch (emailErr) {
            console.error("Email notification failed:", emailErr);
        }


        return res.status(201).json({
            success: true,
            message: "Account approved and created successfully",
            accountNumber: account.accountNumber,
            account
        });


    } catch (err) {
        console.error("Error in approveAccount:", err);
        return res.status(500).json({ success: false, message: "Failed to approve account" });
    }
};

// Manager: Reject account creation request
exports.rejectAccount = async (req, res) => {
    try {
        if (req.user.role !== 'Manager' && req.user.role !== 'Superadmin') {
            return res.status(403).json({ success: false, message: "Unauthorized: Manager or Superadmin  access required" });
        }

        const { userId, refrencenumber } = req.params;

        const user = await usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.kycStatus === 'verified') {
            return res.status(400).json({ success: false, message: "Cannot reject, user is already verified" });
        }

        // Remove/unset KYC fields so the user is forced to upload them again
        await usermodel.findByIdAndUpdate(userId, {
            $unset: {
                pan_image: 1,
                adhar_image: 1,
                signature: 1,
                image: 1,
                address: 1,
                pan_id: 1,
                adhar_id: 1,

            },

        });
        await refernceaccountmodel.deleteOne({ refrencenumber: refrencenumber });
        try {
            await emailservice(
                user.email,
                "Account Request Rejected",
                `Hello ${user.name},\n\nYour account having refrence number ${refrencenumber} quest has been rejected. Please re-apply with valid documents.`
            );
        } catch (emailErr) {
            console.error("Email notification failed:", emailErr);
        }

        return res.status(200).json({
            success: true,
            message: "Account request rejected successfully. User must re-apply with valid documents."
        });

    } catch (err) {
        console.error("Error in rejectAccount:", err);
        return res.status(500).json({ success: false, message: "Failed to reject account" });
    }
};

// Manager can get account details by account number
exports.getaccountdetails = async (req, res) => {
    try {
        if (req.user.role != "Manager" && req.user.role != "Superadmin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Manager or Superadmin access required"
            })
        }

        const { accountNumber } = req.params;
        const account = await accountmodel.findOne({ accountNumber: accountNumber }).populate("user");
        // here account is document object and it has user field which is reference of user model and we populate it to get user details along with account details
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Account details fetched successfully",
            account
        })

    } catch (err) {
        console.error("Error in getaccountdetails:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to get account details due to server error"
        })
    }
}

// Manager can  see tranasaction whose status is flagged do it by account number
exports.getflaggedtransactions = async (req, res) => {
    try {
        if (req.user.role != "Manager" && req.user.role != "Superadmin ") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Manager or Superadmin access required"
            })
        }
        const { accountNumber } = req.params;
        const transactions = await transactionmodel.find({ fromaccount: accountNumber, status: { $regex: /^flagged$/i } });

        if (!transactions || transactions.length === 0) {
            return res
                .status(404)
                .json({
                    success: false,
                    message: "No flagged transactions found for this account"
                })
        }

        return res.status(200).json({
            success: true,
            message: "Flagged transactions fetched successfully",
            transactions: transactions
        })
    } catch (err) {
        console.error("Error in getflaggedtransactions:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to get flagged transactions due to server error"
        })
    }
}       

// Manager: get all pending reference accounts
exports.getallpendingaccounts = async (req, res) => {
    try {
        if (req.user.role !== "Manager" && req.user.role !== "Superadmin ") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Manager or Superadmin access required"
            });
        }
        // The managermiddleware sets req.user to the employee object, which has the 'branch' ObjectId.
        // And the reference account has 'branchCode' as the Branch ObjectId.
        const pendingaccounts = await refernceaccountmodel.find({ branchCode: req.user.branch }).populate("user", "+pan_id +adhar_id +phone +address");
        return res.status(200).json({
            success: true,
            message: "Pending accounts fetched successfully",
            pendingaccounts
        });
    } catch (err) {
        console.error("Error in getallpendingaccounts:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to get pending accounts due to server error"
        });
    }
}
