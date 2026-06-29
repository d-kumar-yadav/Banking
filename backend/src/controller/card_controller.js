const ReferenceCard = require("../models/reference_card");
const Account = require("../models/account_model");


const generateCardNumber = (cardType) => {
    // 4 for Visa (Debit), 5 for Mastercard (Credit)
    const prefix = cardType === 'credit' ? '51' : '4'; 
    let num = prefix;
    while (num.length < 16) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
};

// Apply for a Card (User)
exports.applyCard = async (req, res) => {
    try {
        const { accountId, cardType, cardName } = req.body;
        const userId = req.user._id; // From auth middleware

        if (!accountId || !cardType || !cardName) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        
        const account = await Account.findOne({ _id: accountId, user: userId });
        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found or unauthorized" });
        }

        // Check user's current active cards across all accounts
        const userAccounts = await Account.find({ user: userId });
        let activeDebitCount = 0;
        let activeCreditCount = 0;

        userAccounts.forEach(acc => {
            if (acc.cards) {
                acc.cards.forEach(card => {
                    if (card.status === 'Active') {
                        if (card.cardType === 'debit') activeDebitCount++;
                        if (card.cardType === 'credit') activeCreditCount++;
                    }
                });
            }
        });

        // Check user's pending applications
        const pendingApps = await ReferenceCard.find({ user: userId, status: "Pending" });
        const pendingDebitCount = pendingApps.filter(app => app.cardType === 'debit').length;
        const pendingCreditCount = pendingApps.filter(app => app.cardType === 'credit').length;

       
        if (cardType === 'debit') {
            if (activeDebitCount + pendingDebitCount >= 1) {
                return res.status(400).json({ success: false, message: "You can only have one active or pending debit card at a time." });
            }
        }

        if (cardType === 'credit') {
            if (activeCreditCount + pendingCreditCount >= 2) {
                return res.status(400).json({ success: false, message: "You can only have a maximum of two active or pending credit cards." });
            }
        }

        const application = await ReferenceCard.create({
            user: userId,
            account: accountId,
            cardType,
            cardName
        });

        res.status(201).json({ success: true, message: "Card application submitted successfully", application });
    } catch (error) {
        console.error("ApplyCard Error:", error);
        res.status(500).json({ success: false, message: "Internal server error: " + error.message, stack: error.stack });
    }
};

// Get User's Card Application History (User)
exports.getHistory = async (req, res) => {
    try {
        const applications = await ReferenceCard.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('account', 'accountNumber');
        res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Pending Card Applications (Manager)
exports.getPendingApplications = async (req, res) => {
    try {
        const applications = await ReferenceCard.find({ status: "Pending" })
            .populate('user', 'name email phone pan_id')
            .populate('account', 'accountNumber account_type')
            .sort({ createdAt: 1 });
        res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Approve Card Application (Manager)
exports.approveApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await ReferenceCard.findById(applicationId);
        if (!application || application.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Application not found or already processed" });
        }

        const account = await Account.findById(application.account);
        if (!account) {
            return res.status(404).json({ success: false, message: "Associated account not found" });
        }

        // Generate Card details
        const cardNumber = generateCardNumber(application.cardType);
        
        // Expiry Date (MM/YY) - 5 years from now
        const now = new Date();
        const expiryMonth = String(now.getMonth() + 1).padStart(2, '0');
        const expiryYear = String(now.getFullYear() + 5).slice(-2);
        const expiryDate = `${expiryMonth}/${expiryYear}`;

        const cvv = String(Math.floor(100 + Math.random() * 900));

        const newCard = {
            cardNumber,
            cardType: application.cardType,
            expiryDate,
            cvv,
            status: 'Active'
        };

        // Add card to account
        account.cards.push(newCard);
        await account.save();

        // Update application status
        application.status = "Approved";
        await application.save();

        res.status(200).json({ success: true, message: "Card approved and generated successfully", card: newCard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Reject Card Application (Manager)
exports.rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await ReferenceCard.findById(applicationId);
        if (!application || application.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Application not found or already processed" });
        }

        application.status = "Rejected";
        await application.save();

        res.status(200).json({ success: true, message: "Card application rejected" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
