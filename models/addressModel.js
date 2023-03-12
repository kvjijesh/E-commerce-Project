const mongoose=require('mongoose');


const addressSchema=new mongoose.Schema({
    owner:{
        type:String
    },
        name:{
            type:String
        },
        mobile:{
            type:String
        },
        address1:{
            type:String
        },
        address2:{
            type:String
        },
        city:{
            type:String
        },
        state:{
            type:String
        },
        zip:{
            type:String
        }
})
module.exports=mongoose.model('Address',addressSchema);