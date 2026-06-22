
require("dotenv").config(); 
const mongoose = require("mongoose");
const Employee = require("../src/models/employe_model");

async function createUser() {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to the database successfully!");

    // 2. Define the user data
    const newUser = new Employee({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "securepassword123", // Will be automatically hashed by your schema
      phone: "+919999999999",       
      role: "Superadmin",
      status: "Active"
    });

    // 3. Save the user to the database
    await newUser.save();
    console.log("User created successfully!");
    console.log("Generated Employee ID:", newUser.employeeId);
    
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    // 4. Always close the connection and exit the process
    mongoose.connection.close();
    process.exit(0);
  }
}

createUser();

/* 
=========================================
HOW TO RUN THIS SCRIPT:
=========================================

1. Open your terminal.
2. Navigate to your backend directory by running:
   cd d:\Banking\backend

3. Run the script using Node.js:
   node scripts/create_user.js

=========================================
*/
