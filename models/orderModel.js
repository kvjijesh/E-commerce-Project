const mongoose=require('mongoose');
const orderSchema=new mongoose.Schema({
    owner:{
        type:String,
    },

    address:{type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
        required:true},

    items: [
    {
        product: { type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'},
        quantity:{type:Number}

    }],
    paymentMode : {
        type : String
    },
    orderBill : {
        type : String
    },
    discount : {
        type : String
    },
    status: {
        type: String,
        enum: ['ordered', 'pending','confirmed', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'],
        default: 'ordered'
      },
    orderDate : {
        type : String,

    },
    orderId:{
        type:String
    }

} ,{timestamps: true})
module.exports=mongoose.model('Order',orderSchema);