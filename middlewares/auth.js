var isLogin = async(req,res,next)=>{
    try {

        if(req.session.userData){}
        else{
            res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }

}
var isLogout = async(req,res,next)=>{
    try {
        if(req.session.userData){
            res.redirect('/home')
        }
        next()

    } catch (error) {
        console.log(error.message);
    }

}



module.exports ={
    isLogin,
    isLogout,
}