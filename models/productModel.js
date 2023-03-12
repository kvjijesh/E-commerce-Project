const mongoose=require('mongoose');



// Declare the Schema of the Mongo model
const productschema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:Array,
        required:true

    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true,

    },

    stock:{
        type:Number,
        default:0
    },
    is_blocked:{
        type:Boolean,
        default:false
    }





});
module.exports=mongoose.model('Product',productschema);

