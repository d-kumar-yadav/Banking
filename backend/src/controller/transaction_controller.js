
const axios = require("axios");
const mongoose = require("mongoose");
const transactionmodel= require("../models/transaction");
const ledgermodel= require("../models/ledger");
const accountmodel= require("../models/account_model");
const usermodel = require("../models/user_model");
const { getFraudScore } = require("../ml_service/fraud_service.js");
const {email_payment_notification, emailservice}= require("../service/email");
const { sms_payment_notification } = require("../service/sms");




exports.transactioncontroller = async(req,res)=>{

    try {
        const {fromaccount , toaccount , amount , idempotencykey, transferType = "Normal"}= req.body;

        // step 1: validate the request body
        if(!fromaccount || !toaccount || !amount || !idempotencykey){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }       

        // validate transfer limits

        if(fromaccount === toaccount){
            return res.status(400).json({ success: false, message: "From and To account numbers cannot be the same." });
        }
        if (transferType === "Normal") {
            if (amount >= 100000) {
                return res.status(400).json({ success: false, message: "Normal transfer limit is strictly less than 1,00,000 INR." });
            }
        } else if (transferType === "NEFT" || transferType === "RTGS") {
            if (amount < 100000 || amount > 500000) {
                return res.status(400).json({ success: false, message: `${transferType} transfer must be between 1,00,000 and 5,00,000 INR.` });
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid transfer type." });
        }

        // explicitly select the phone field since it defaults to select: false in the schema
        const userfromaccount = await accountmodel.findOne({ accountNumber: fromaccount }).populate({
            path: 'user',
            select: '+phone'
        });
        const usertoaccount = await accountmodel.findOne({ accountNumber: toaccount }).populate({
            path: 'user',
            select: '+phone'
        });

        if (!userfromaccount) {
            return res.status(404).json({
                success: false,
                message: "From account not found"
            });
        }


        const isExternal = !usertoaccount;
  
       
        

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

        // step 3: check account status 
        if (userfromaccount.status !== "Active") {
            return res.status(400).json({ success: false, message: "From account is not active" });
        }
        if (!isExternal && usertoaccount.status !== "Active") {
            return res.status(400).json({ success: false, message: "To account is not active" });
        }

        // step 4: check sender balance
        const senderbalance= await userfromaccount.getbalance();
        if(senderbalance < amount){
            return res.status(400).json({
                success:false,
                message:`Insufficient   balance your  current balance is ${senderbalance} and amout is ${amount}` 
            })
        }

        let receiverbalance = 0;// if we define const inside if block then it will not be accessible outside that block but we need it in fraud check so we define it here
        

        if (!isExternal) {
            receiverbalance = await usertoaccount.getbalance();
        }
        
        // --- PRE-PAYMENT FRAUD CHECK ---
        const fraudFeatures = {
            amount: amount,
            sender_old_balance: senderbalance,
            sender_new_balance: senderbalance - amount,
            receiver_old_balance: isExternal ? 0.0 : receiverbalance,
            receiver_new_balance: isExternal ? 0.0 : receiverbalance + amount,
        };
        console.log("Fraud features sent to ML:", fraudFeatures);

        let fraudResult = { risk_level: 'LOW', fraud_score: 0 };
        try {
            console.log(" Calling ML fraud service...");
            fraudResult = await getFraudScore(fraudFeatures);
            console.log(`Fraud Check Result: ${fraudResult.risk_level} (Score: ${fraudResult.fraud_score})`);
        } catch (fraudError) {
            console.error(" Fraud check FAILED:", fraudError.message || fraudError);
            console.error("ML service likely down - proceeding with transaction");
        }

        if (fraudResult.risk_level === 'HIGH') {
            try {
                // Freeze account immediately
                await accountmodel.findByIdAndUpdate(userfromaccount._id, { status: "Frozen" });
                 
                if (req.io && userfromaccount.user && userfromaccount.user._id) {
                    req.io.to(userfromaccount.user._id.toString()).emit("account_frozen", {
                        accountNumber: userfromaccount.accountNumber,
                        message: "Your account has been frozen due to suspicious activity. Please contact the bank."
                    });
                }
                try {
                    await emailservice(
                        userfromaccount.user.email,
                        "Account Frozen",
                        `Hello ${userfromaccount.user.name},\n\nYour account with Account Number ${userfromaccount.accountNumber} has been frozen due to suspicious activity. Please visit your bank for further assistance.`
                    );
                } catch (err) {
                    console.error("Failed to send frozen account email:", err.message);
                }

                // Record the blocked transaction attempt
                await transactionmodel.create({
                    fromaccount: userfromaccount.accountNumber,
                    toaccount: toaccount,
                    amount,
                    idempotencykey,
                    status: "flagged",
                    isFraud: true,
                    fraudScore: fraudResult.fraud_score
                });

                return res.status(403).json({
                    success: false,
                    message: "Transaction blocked due to suspicious activity. Your account has been frozen."
                });
            } catch (blockError) {
                console.error("Error during blocking transaction:", blockError);
                return res.status(500).json({ success: false, message: "Internal server error during fraud prevention" });
            }
        }
      
        const session= await mongoose.startSession();
        // create session
        session.startTransaction();
        // initiates the transaction on that session. like updates , delete ,insert

        let transaction; // Declare here so it's accessible after try block

        try {  // you are temporarily storing this transaction object in your server's RAM (Node.js memory). 
            transaction= new transactionmodel({
                fromaccount: userfromaccount.accountNumber,
                toaccount: toaccount, // Replaced usertoaccount.accountNumber to avoid crash if it doesn't exist
                amount,
                idempotencykey,
                transferType,
                status: isExternal ? "Processing_External" : "Pending",
                isExternal: isExternal
            } ) 
            
            // SIMULATE NEFT DELAY PROTOTYPE (10 SECONDS)
            if (transferType === "NEFT") {
                console.log("Simulating NEFT batch clearance delay (10s)...");
                await new Promise(r => setTimeout(r, 10000));
                console.log("NEFT batch cleared.");
            }

            // step -6
            const debitledgerentry= await ledgermodel.create([{
                account: userfromaccount.accountNumber,
                amount:amount,
                transaction:transaction._id,
                type:"debit"
            }] , {session}) 

            // step - 7 (Only generate credit entry for internal transfers)
            if (!isExternal) {
                const creditledgerentry= await ledgermodel.create([{
                    account: toaccount,
                    amount:amount,
                    transaction:transaction._id,
                    type:"credit"
                }] , {session})
            }

            // step -8
            if (!isExternal) {
                transaction.status = "Completed";
            }
            await transaction.save({session});
            //This line tells Mongoose to save the transaction document (which you created in memory) to the database, but only within the isolated "bubble" of the current session.
//At this exact moment, the data has not been permanently written to the main database
            await session.commitTransaction();
//This is the final approval. This line tells MongoDB: "All the steps in my process (creating the debit ledger, creating the credit ledger, and saving the transaction) have finished without any errors. Please make all of these changes permanent and visible to everyone right no

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            // step -9
            session.endSession();
        }

        // call to  the Central Hub (External Only) ---
        if (isExternal) {
            try {
                // Extract only the letters from the account string to match SBI, HDFC, ICICI
                let bankCode = toaccount.replace(/[^a-zA-Z]/g, '').toUpperCase();
                if (!bankCode) bankCode = "UNKNOWN"; // Fallback for invalid formats

                // Call FastAPI Settlement
                let baseUrl = process.env.FASTAPI_URL || "http://localhost:8000";
                baseUrl = baseUrl.replace(/\/+$/, '');
                const hubResponse = await axios.post(`${baseUrl}/central_hub_v2/settle`, {
                    amount,
                    from_account: fromaccount,
                    to_account: toaccount,
                    bank_code: bankCode // Dynamically sends 'HDFC' or 'SBI'
                });

                if (hubResponse.data.status === "SUCCESS") {
                    await transactionmodel.findByIdAndUpdate(transaction._id, {
                        status: "Completed", referenceId: hubResponse.data.rrn
                    });
                } else {
                    throw new Error(hubResponse.data.reason || "External bank rejected");
                }
            }
             catch (error) {
                // --- PHASE 3: AUTOMATIC REFUND ---
                console.error("Settlement failed, initiating refund...");
                await ledgermodel.create({
                    account: fromaccount, amount, transaction: transaction._id, type: "credit", adminRemarks: "Auto-refund: Settlement failed"
                });
                await transactionmodel.findByIdAndUpdate(transaction._id, { status: "Failed" });
                
                return res.status(502).json({ success: false, message: "Inter-bank failed: Money refunded to your account" });
            }
            } 
        

        // step -10  email notification
        // Send email notification to sender
        const senderEmail = userfromaccount.user.email;
        const senderName = userfromaccount.user.name;
        const senderPhone = userfromaccount.user.phone;
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        
        try {
            await email_payment_notification(senderEmail, senderName, amount, toaccount, currentDate, currentTime, transaction._id, true);
        } catch (err) {
            console.error("Failed to send sender email notification:", err.message);
        }
        
        if (senderPhone) {
            try {
                await sms_payment_notification(senderPhone, senderName, amount, toaccount, true);
            } catch (err) {
                console.error("Failed to send sender SMS:", err.message);
            }
        }

        // Send email notification to receiver only if it's an internal account  
        if (!isExternal && usertoaccount && usertoaccount.user) {
            const receiverEmail = usertoaccount.user.email;
            const receiverName = usertoaccount.user.name;
            const receiverPhone = usertoaccount.user.phone;
            
            try {
                await email_payment_notification(receiverEmail, receiverName, amount, fromaccount, currentDate, currentTime, transaction._id, false);
            } catch (err) {
                console.error("Failed to send receiver email notification:", err.message);
            }

            if (receiverPhone) {
                try {
                    await sms_payment_notification(receiverPhone, receiverName, amount, fromaccount, false);
                } catch (err) {
                    console.error("Failed to send receiver SMS:", err.message);
                }
            }
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








// transaction history
exports.transaction_history = async (req, res) => {
    try {
        const userId = req.user._id;
        const { accountNumber } = req.params; 

        // Step 1: Verify the account belongs to the logged-in user  first
        const account = await accountmodel.findOne({ accountNumber: accountNumber, user: userId });
        
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found or unauthorized access"
            });
        }

        // Step 2: Fetch transactions 
        const transactions = await transactionmodel.find({
            $or: [{ fromaccount: account.accountNumber }, { toaccount: account.accountNumber }]
        })
        .select("-__v -idempotencykey")
        .sort({ createdAt: -1 }) 
//this specifies descending order. It means the highest/newest dates will be at the top of the array, and the oldest at the bottom. 
// (If you used 1, it would sort in ascending order, meaning oldest first).
// fromaccount will show only that transaction history where user have send money
 // but toaccount  will show only that trnasaction hisyory where user have received money
        .lean(); // Converts to plain JS objects so we can easily modify properties

  // Format the output: rename _id, format date/time, and remove createdAt/updatedAt
        const formattedTransactions = transactions.map(txn => {
            const { _id, createdAt, updatedAt, ...rest } = txn;   // destructure
  //   It tells JavaScript: "Take the txn object, pull out _id, createdAt, and updatedAt into their own separate variables. 
//   Then, take all the rest of the properties left over and bundle them into a new object called rest          
        
            const isSent = txn.fromaccount === account.accountNumber;


            return {
                transactionId: _id,
                transactionType: isSent ? "Sent" : "Received", 
                ...rest, // Spread the remaining fields (amount, status, fromaccount, toaccount)
                paymentDate: new Date(createdAt).toLocaleDateString(),
                paymentTime: new Date(createdAt).toLocaleTimeString()
            };
        });
        return res.status(200).json({
            success: true,
            message: "Transaction history fetched successfully",
            count: transactions.length,
            transactions: formattedTransactions
        });

    } catch (err) {
        console.error("Error in transaction history controller", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        }); 
    }
};