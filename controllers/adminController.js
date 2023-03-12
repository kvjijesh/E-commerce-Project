const Admin=require('../models/adminModel')
const User=require('../models/userModel')
const Coupon=require('../models/couponModel')
const Order=require('../models/orderModel.js')
const Banner=require('../models/bannerModel')
const bcrypt =require('bcrypt')
const hbs=require('hbs')
hbs.registerHelper('formatDate', function(date, format) {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    const formattedDate = new Date(date).toLocaleString('en-US', options);
    return formattedDate;
  });


const securePassword = async(password)=>{
    try {
      const passwordHash=  await bcrypt.hash(password, 10)
      return passwordHash

    } catch (error) {
console.log(error.message);
    }

}

const blockfun=async (paramsId)=>{
    const abc= await User.findByIdAndUpdate(paramsId,{$set:{is_blocked:1}},{new:true})
    return abc

}
const unblockfun=async (paramsId)=>{
    const bcd= await User.findByIdAndUpdate(paramsId,{$set:{is_blocked:0}},{new:true})
    return bcd

}


const adminLogin =async(req,res)=>{
    try {

        res.render('adminViews/adminLogin')

    } catch (error) {
        console.log(error.message);
    }
}

const createAdmin= async (req,res)=>{
    try {
        const spassword=await securePassword(req.body.password);

        console.log(req.body.name,req.body.mobile)

        email=req.body.email
        console.log(email)

        const exist=await Admin.findOne({email:email})
        console.log(exist)
        if(exist==null){
        const admin = new Admin({
            name:req.body.name,
            email:req.body.email,
            password:spassword,
            role:req.body.role
            })
           const adminData= await admin.save();
           console.log(admin);



   console.log(admin);
            if(adminData){
                res.render('adminViews/adminSignup',{message:"Registration successfull Please login"})
            }
            else{
                res.render('adminViews/adminSignup',{message:"User Registration failed"})
            }


        }
        else{
            if(exist.email==email){
                res.render('adminViews/adminSignup',{message:"Email already exist"})
            }
        }

    } catch (error) {
        console.log(error.message)
    }
}
const loadSignup=async (req,res)=>{
    try {
        res.render(('adminViews/adminSignup'))
    } catch (error) {
        console.log(error.message);
}}
const verifyAdminLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password= req.body.password
        console.log(email,password);
        const adminData = await Admin.findOne({email:email})
        console.log(adminData);
        if(adminData){
            const passwordMatch=await bcrypt.compare(password,adminData.password)
            if(passwordMatch){
                if(adminData.role=="Admin"){
                    req.session.admin_id=adminData._id
                    console.log(req.session);
                    res.redirect('admin/home')
                }
                else{
                    res.render('adminViews/AdminLogin',{message:'Un authorised access !!'})
                }
            }
            else{
                res.render('adminViews/AdminLogin',{message:'User name or password incorrect'})
            }
        }
        else{
            res.render('adminViews/AdminLogin',{message:'Admin Not exist !!'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard =async(req,res)=>{
    try {
  const id=req.session.admin_id

        const adminData=await Admin.findById({_id:id})
        console.log({_id:req.session.admin_id});
        res.render('adminViews/adminDashboard',{admin:adminData})

    } catch (error) {
    console.log(error.message);
    }
    }
const logout= async(req,res)=>{
        try {
            // req.session.admin_id==null
             req.session=null
            //req.session.destroy();
            console.log(req.session);
            console.log('hihuggfgfftffgfgfcgfcfgff');
            res.redirect('/admin')


        } catch (error) {
            console.log(error.message);
        }
    }
const userList= async(req,res)=>{
        try {
           const usersData =await User.find()
            res.render('adminViews/userList',{usersData})


        } catch (error) {
            console.log(error.message);
        }
    }

const blockUser= async(req,res)=>{
        try {
            const blocked= await User.findById(req.params.id)
    console.log(blocked);
    const userblocked = blocked.is_blocked
    console.log(userblocked);

if(userblocked){

  unblockfun(req.params.id)
res.redirect('/admin/userList')
  console.log(userblocked);
}else{
    blockfun(req.params.id)

    res.redirect('/admin/userList')
    console.log(userblocked);
}

        } catch (error) {
            console.log(error.message);

        }
    }

    const couponPage=async(req, res) => {
        const coupon= await Coupon.find()
        console.log(coupon);
        res.render('adminViews/couponlist',{couponData:coupon})
    }


    const createCouponLoad= async(req,res)=>{

        res.render('adminViews/createCoupon')



    }
    const createCoupon= async(req,res)=>{
        console.log(req.body);

        const coupon = await Coupon.create(req.body);
        //res.status(201).json(coupon);
        res.redirect('/admin/coupon')

    }

const orderList=async(req,res)=>{
const orderData = await Order.find({status:{$ne:'delivered'}})
  .populate("items.product")
  .populate("address")
  .sort({ createdAt: -1 });


        res.render('adminViews/orderList',{orderData:orderData})



    }
const changeStatus=async(req,res)=>{

        try {
            const id=req.body.id
            const status=req.body.status

            const order = await Order.findByIdAndUpdate(id, { $set: { status: status } }, { new: true });
            res.redirect("/admin/order-list")

        } catch (error) {
            console.log(error);
        }
    }
    const deleteCoupon= async(req,res)=>{
        try {
            const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
            res.redirect('/admin/coupon')


        } catch (error) {
            console.log(error);
                res.render('error')
        }
    }
 const editCoupon=async(req,res)=>{
try {
    const couponId=req.params.id
    const coupon = await Coupon.findById(couponId);
    res.render('adminViews/editcoupon',{coupon})
} catch (error) {

}

 }
 const updateCoupon=async(req,res)=>{
    try {
        const couponData=req.body
        console.log(couponData);
        await Coupon.findByIdAndUpdate(req.params.id,{
            code:req.body.code,
            value:req.body.value,
            minBill:req.body.minBill,
            ...(req.body.expiryDate && { expiryDate: req.body.expiryDate }),
            status:req.body.status
        },{new:true})
        res.redirect('/admin/coupon')

    } catch (error) {
        res.render('error')

    }
 }

 const bannerLoad= async(req,res)=>{

    const banner=await Banner.find()

    res.render('adminViews/banner',{banner})
 }

const createBannerLoad=async(req,res)=>{
    res.render('adminViews/createBanner')


}

const createBanner = async (req, res) => {
    console.log(req.body)

    const file = req.file;
        const fileName = file.filename
        const basePath = '/images/';

    try {
      const banner = new Banner({
        title:req.body.title,
        description:req.body.description,
        image:`${basePath}${fileName}`,
        linkUrl:req.body.linkUrl,
        status:req.body.status
      });
      await banner.save()

      res.redirect('/admin/banner')
    } catch (error) {
      res.render('error' )

    }
  };




//exports
module.exports={
    adminLogin,
    createAdmin,
    loadSignup,
    verifyAdminLogin,
    loadDashboard,
    logout,
    userList,
    blockUser,
    createCouponLoad,
    couponPage,
    createCoupon,
    orderList,
    changeStatus,
    deleteCoupon,
    editCoupon,
    updateCoupon,
    bannerLoad,
    createBannerLoad,
    createBanner


}
