const mongoose=require('mongoose')
mongoose.set('strictQuery', false)

const dbConnect=()=>{
    try {
const conn =mongoose.connect(process.env.MONGODB_URL)
console.log('Db connected');


    } catch (error) {
        console.log("Data base error");
    }
}
module.exports=dbConnect