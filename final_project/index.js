const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const sessionToken = req.session.token;
    const bearerToken = req.header('Authorization');
    
    if (sessionToken || bearerToken) {
        try {
        const token = bearerToken ? bearerToken.split(' ')[1] : sessionToken;
        const decoded = jwt.verify(token, 'your_secret_key');
        req.userId = decoded.userId;
        next();
        } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
