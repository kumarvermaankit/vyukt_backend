const Mongoose = require('mongoose');
const { Schema } = Mongoose;

// Order Schema
const OrderSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  total: {
    type: Number,
    default: 0
  },
  address:{
    type:"String"
  },
  phoneNumber:{
    type:"String"
  },
  payment:{
    type:"String"
  },
  payment_method:{
    type:"String"
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mongoose.model('Order', OrderSchema);
