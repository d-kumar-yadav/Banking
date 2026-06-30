const express = require("express");
const cookieParser = require("cookie-parser");
const http= require("http")
const { Server } = require("socket.io")
const cors = require("cors");


const authroutes=  require("./routes/auth_routes");
const accountroutes= require("./routes/account_creation");
const transactionroutes= require("./routes/transaction_route");
const mlRoutes = require("./routes/ml_routes");
const loanroutes = require("./routes/loan_routes");
const superadminroutes= require("./routes/superadmin_routes");
const cardRoutes = require("./routes/card_routes");




const app = express(); 
const httpServer = http.createServer(app);

// Initialize web  Socket.io server , to manage event like user connection, disconnetion 
/* 
// --- UNCOMMENT FOR STRICT LOCAL DEVELOPMENT ---
const io = new Server(httpServer, {
    cors: { origin:  ['http://localhost:5173', 'http://localhost:5174']  } // allow frontend to talk with backend from any origin any where 3000 or 8000 port
});
*/

const io = new Server(httpServer, {
    cors: { 
        origin: function (origin, callback) {
            callback(null, origin || true);
        },
        credentials: true
    }
});

// Middleware to make 'io' available in all your controllers via 'req.io'
app.use((req, res, next) => {
    req.io = io;  // attach the socket to incmooming request
    next();
});


// Listen for WebSocket connections from frontend side
// io.on('connection', ...): This is a listener. It stays active 24/7. As soon as a user opens your website, this function triggers.

// socket: This represents the specific connection of that one user. Every user gets a unique socket.id.
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);


    socket.on('join', (userId) => {
        socket.join(userId);   // This creates a Private Room. In a bank, you don't want everyone to see your credit score. By joining a room named after their userId, you can send private messages specifically to that user later using io.to(userId).emit(...).
        console.log(`User ${userId} joined their personal room.`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Enable CORS for Express API routes
/*
// --- UNCOMMENT FOR STRICT LOCAL DEVELOPMENT ---
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow your Vite frontend to connect
    credentials: true                // Required for sending/receiving cookies and tokens
}));
*/

app.use(cors({
    origin: function (origin, callback) {
        callback(null, origin || true); // Dynamically allow the Vercel origins
    },
    credentials: true                // Required for sending/receiving cookies and tokens
}));

app.use(express.json()); // middleware to parse incoming JSON data in the request body and make it available in req.body
app.use(cookieParser()); // middleware to parse cookies from the incoming request and make them available in req.cookies

 
// for login and registration ,logout
 app.use("/api/auth" ,authroutes);
 // for account 
app.use("/api/accounts" , accountroutes);

app.use("/api/ml", mlRoutes);

//  for laon
app.use("/api/loan", loanroutes);

// for superadmin , manager and employee related routes
app.use("/api" ,superadminroutes );

// for transactin
app.use("/api/user" , transactionroutes)

// for cards
app.use("/api/cards", cardRoutes);





module.exports = httpServer;