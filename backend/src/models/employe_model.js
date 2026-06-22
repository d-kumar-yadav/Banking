const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const countermodel = require("./counter_model");

const employeeSchema = new mongoose.Schema({
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
    password:{
        type: String,
        required: [true, "Password is required"],
        select: false
    },
  
    employeeId: {
        type: String,
        required: [true, "Employee ID is required"],
        unique: true
    },
    
    phone: {

        type: String,
        required: [true, "Employee phone number is required"],
        unique: true,
        match: [/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, "Please fill a valid phone number"],
        select: false
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
           
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
        enum: ["Active", "Inactive"]  ,
        default: "Active"

    },
    role:{
        enum:["Manager" , "Employee","Superadmin"],
        type: String,
        required: [true, "Role is required"],
        default: "Employee"
    },
    lastLogin: {
        type: Date
    }

}); 

// Auto-increment logic for Employee ID (ESBI0001, ESBI0002...)
employeeSchema.pre("validate", async function () {
    if (this.isNew && !this.employeeId) {
        try {
            const counter = await countermodel.findOneAndUpdate(
                { _id: 'employee_id' },
                { $inc: { seq: 1 } },
                { returnDocument: 'after', upsert: true }
            );
            this.employeeId = "ESBI" + String(counter.seq).padStart(5, '0');
         
        } catch (error) {
            console.error("Error in counter update:", error);
         
          throw error;
        }
    } 
});

// Hash password before saving
employeeSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  
});

employeeSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const employee = mongoose.model("employee", employeeSchema);
module.exports = employee ;