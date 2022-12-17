const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const OTPSchema = new Schema({
    email:{
        type:String,
        
    },
    otp:{
        type:String
    }
},{timestamps:true})

module.exports = Mongoose.model('OTP', OTPSchema);
