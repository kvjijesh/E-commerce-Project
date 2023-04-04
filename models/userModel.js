const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,

    },
    mobile:{
        type:Number,
        required:true,

    },
    email:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true,
    },
    is_blocked:{
        type:Boolean,
        default:false

    },
    is_verified:{
        type:Number,
        default:0

    },
    cart: [
        {
          product: {
             type: mongoose.Schema.Types.ObjectId,
            //type:String
             ref: 'Product',
          },
          quantity: {
            type: Number,
            default: 1,
          },
          cartTotal: {
            type: Number,

          },
        },
      ],
});

//Export the model
module.exports = mongoose.model('User', userSchema);