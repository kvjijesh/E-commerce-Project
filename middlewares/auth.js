const  User=require('../models/userModel')

var isLogin = async(req,res,next)=>{
    try {

        if(req.session.user){
            next()
        }
        else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }

}
var isLogout = async(req,res,next)=>{
    try {
        if(req.session.user){
            res.redirect('/home')
        }
        else
        next()

    } catch (error) {
        console.log(error.message);
    }

}

const isBlocked=async(req,res,next)=>{
    try {
    const userData= req.session.user;
    const id= userData._id
     const user = await User.findById(id)
     if(user.is_blocked){
       res.redirect('/logout')
     }else{
        next()
     }
    } catch (error) {
        res.status(500).send({message:"Some thing went wrong, Contact help"})    }
}


module.exports ={
    isLogin,
    isLogout,
    isBlocked
}