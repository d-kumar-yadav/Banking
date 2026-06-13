const server = require("./src/app");
const connecttodb = require("./src/config/db");
const { transporter } = require("./src/service/email");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// 1. Connect to Database
connecttodb();

// 2. Verify Email Server Connection
transporter.verify((error, success) => {
    if (error) {
        console.error("Failed to connect to email server:", error.message);
    } else {
        console.log("Connected to email server successfully.");
    }
});

// 3. Start Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});