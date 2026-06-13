const monggose = require("mongoose");
const countermodel = require("./counter_model");

const managerSchema = new monggose.Schema({
    name: {
        type: String,   
        required: [true, "Manager name is required"]
    },
    email: {
        type: String,
        required: [true, "Manager email is required"],
        unique: true,   
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Manager password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    managerId: {
        type: String,
        required: [true, "Manager ID is required"],
        unique: true
    },
    
    phone: {

        type: String,
        required: [true, "Manager phone number is required"],
        unique: true,
        match: [/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, "Please fill a valid phone number"],
        select: false
    },
    branch: {
        type: monggose.Schema.Types.ObjectId,
        ref: "Branch",
        required: [true, "Manager must be assigned to a branch"]    
    },
    createdAt: {
        type: Date,
        default: Date.now   
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Active",
        enum: ["Active", "Inactive"]  
    }

}); 

// Auto-increment logic for Manager ID (MSBI0001, MSBI0002...)
managerSchema.pre("validate", async function (next) {
    if (this.isNew && !this.managerId) {
        try {
            const counter = await countermodel.findOneAndUpdate(
                { _id: 'manager_id' },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this.managerId = "MSBI" + String(counter.seq).padStart(5, '0');
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const manager = monggose.model("manager", managerSchema);
module.exports = manager;