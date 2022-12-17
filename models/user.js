const Mongoose = require('mongoose');
const { ROLE_ADMIN, ROLE_MEMBER, ROLE_MERCHANT } = require('../constants');

const { Schema } = Mongoose;

// User Schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: () => {
      return this.provider !== 'email' ? false : true;
    }
  },
  phoneNumber: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  password: {
    type: String
  },
  googleId: {
    type: String
  },
  facebookId: {
    type: String
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    default: ROLE_MEMBER,
    enum: [ROLE_ADMIN, ROLE_MEMBER, ROLE_MERCHANT]
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  walletAmount:{
    type:String
  },
  upi_id:{
    type:String
  },
  redeem:{
    type:Boolean,
    default:false

  }
});

module.exports = Mongoose.model('User', UserSchema);