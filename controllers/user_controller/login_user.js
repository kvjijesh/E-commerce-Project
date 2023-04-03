const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

let userRegData;
let otp;
let otpforget;
let userOtp;
let uEmail;

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//send  verification otp
const sendOtp = async (name, email) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const otp = `${Math.floor(1000 + Math.random() * 90000)}`;
    const mailoption = {
      from: "kvjijesh2@gmail.com",
      to: email,
      subject: " OTP Verification mail",
      text: `hello ${name} your otp ${otp}`,
    };
    transporter.sendMail(mailoption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been set", info.response);
      }
    });
    return otp;
  } catch (error) {
    console.log(error.message);
  }
};
const loadSignup = async (req, res) => {
  try {
    res.render("userViews/signup");
  } catch (error) {
    console.log(error.message);
  }
};

const otpsubmit = async (req, res) => {
  try {
    const spassword = await securePassword(userRegData.password);
    const enteredotp = req.body.otp;

    if (enteredotp) {
      if (enteredotp == otp) {
        const user = new User({
          name: userRegData.name,
          mobile: userRegData.mobile,
          email: userRegData.email,
          password: spassword,
          is_blocked: 0,
          is_verified: 0,
        });
        const userData = await user.save();
        res.render("userViews/signup", {
          message: "Registration successfull Please login",
        });
      } else {
        res.render("userViews/verifyOtp", { message: "Invalid otp" });
      }
    } else {
      res.render("userViews/verifyOtp", { message: "Please enter OTP" });
    }
  } catch (error) {
    console.error(error);
  }
};

const createUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    userRegData = req.body;

    const existUser = await User.findOne({ email: email });

    if (existUser == null) {
      otp = await sendOtp(name, email);

      res.render("userViews/verifyOtp");
    } else {
      if (existUser.email == email) {
        res.render("userViews/signup", { message: "Email already exist" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadLogin = async (req, res) => {
  try {
    res.render("userViews/login", { title: "Login" });
  } catch (error) {
    console.log(error.message);
  }
};
const verifyLogin = async (req, res) => {
  try {
    const {email,password}=req.body
    const userData = await User.findOne({ email: email });
    const isBlock = userData.is_blocked;

    if (userData) {
      if (!isBlock) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (passwordMatch) {
          req.session.user = userData;

          req.session.userData = true;
          const mySession = req.session.user;
          res.redirect("/home");
        } else {
          res.render("userViews/login", {
            message1: "Email or Password in correct",
          });
        }
      } else {
        res.render("userViews/login", { message2: "Un Authersised aceess !!" });
      }
    } else {
      res.render("userViews/login", {
        message3: "Email or Password in correct",
      });
    }
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};
const forgetLoad = async (req, res) => {
  try {
    res.render("userViews/enterEmail");
  } catch (error) {
    console.log(error.message);
    res.render("error");
  }
};
const forgetPostOtp = async (req, res) => {
  try {
    uEmail = req.body.email;
    console.log(uEmail);
    const userExist = await User.findOne({ email: uEmail });
    console.log(userExist);
    if (userExist == null) {
      res.render("userViews/enterEmail", { message: "Email does not exist" });
    } else {
      if (!userExist.is_blocked) {
        const name = userExist.name;
        otpforget = await sendOtp(name, uEmail);
        res.render("userViews/forgetOtpVerify");
      } else {
        res.render("userViews/enterEmail", {
          message1: "No access..Please Contact Admin",
        });
      }
    }
  } catch (error) {
    res.render("error");
  }
};

const forgetOtpVerify = async (req, res) => {
  try {
    userOtp = req.body.otp;
    if (otpforget == userOtp) {
      res.render("userViews/passwordReset");
    } else {
      res.render("userViews/forgetOtpVerify", { message: "Invalid OTP" });
    }
  } catch (error) {
    res.render("error");
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    console.log(password);
    const spassword = await securePassword(password);
    //const user=await User.findOne({email:uEmail})
    const user = await User.findOneAndUpdate(
      { email: uEmail },
      { password: spassword },
      { new: true }
    );
    console.log(user);
    // res.render('userViews/login',{mymessage:'Password reset successfull please login'})
    res.redirect("/login");
  } catch (error) {
    res.render("error");
  }
};

module.exports = {
  loadSignup,
  createUser,
  verifyLogin,
  loadLogin,
  userLogout,
  otpsubmit,
  forgetLoad,
  forgetPostOtp,
  forgetOtpVerify,
  resetPassword,
};
