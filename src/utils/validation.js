const validator = require('validator');

const validateSignupData = (req) => {
    const { firstName, email, password, age, height, weight, goal, gender } = req.body;
    if(!firstName || !email || !password || !age || !height || !weight || !goal || !gender) {
        throw new Error("All fields are required");
    }
    if(!validator.isEmail(email)) {
        throw new Error("Invalid email address");
    }
    if(!validator.isStrongPassword(password)) {
        throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol");
    }
}

module.exports = {
    validateSignupData,
}