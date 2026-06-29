const server = require("./src/app");
const connecttodb = require("./src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// 1. Connect to Database
connecttodb();



// 3. Start Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});