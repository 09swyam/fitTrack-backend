const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
    try{
        const token = req.cookies.token;
        if(!token) {
            throw new Error("Unauthorized");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if(!user) {
            throw new Error("Unauthorized");
        }
        req.user = user;
        next();
    }
    catch(err){
        res.status(401).send({Error: "Unauthorized"});
    }
}

module.exports = userAuth;