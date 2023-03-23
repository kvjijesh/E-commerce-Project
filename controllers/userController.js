const User = require("../models/userModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const { find, findById } = require("../models/userModel");
const nodemailer = require("nodemailer");
const Category = require("../models/categoryModel");
const { getAllProducts } = require("./productController");
const Address = require("../models/addressModel");
const Banner = require("../models/bannerModel");
const hbs = require("hbs");

// define a helper function
hbs.registerHelper("calculateItemPrice", function (item) {
  return item.product.price * item.quantity;
});

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

const loadHome = async (req, res) => {
  try {
    const categories = await Category.find();
    const banner = await Banner.find();
    const products= await Product.find({is_blocked:false})

    if (categories) {
      if (req.session.userData) {
        const userlogData = req.session.user;

        res.render("userViews/home", {
          categories: categories,
          userData: userlogData,
          banner: banner,
          products
        });
      } else {
        res.render("userViews/home", {
          categories: categories,
          banner: banner,
          products
        });
      }
    } else {
      res.send("category does not exist");
    }
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
  const spassword = await securePassword(userRegData.password);
  const enteredotp = req.body.otp;

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
    const email = req.body.email;
    const password = req.body.password;

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
    console.log(error.message);
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

const profileLoad = async (req, res) => {
  try {
    const userData = req.session.user;
    res.render("userViews/userprofile", { userData });
  } catch (error) {
    console.log(error.message);
  }
};

const adressLoad = async (req, res) => {
  const userData = req.session.user;
  const id = userData._id;

  const userAddress = await Address.find({ owner: id });

  if (req.session.user) {
    res.render("userViews/adresspage", { userData, userAddress });
  }
};

const addAdressLoad = async (req, res) => {
  const userData = req.session.user;

  if (userData) {
    res.render("userViews/addAddress", { userData });
  }
};

const addAddress = async (req, res) => {
  try {
    const userData = req.session.user;
    const id = userData._id;
    console.log(req.body)
    const address = new Address({
      owner: id,
      name: req.body.name,
      mobile: req.body.mobile,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    });
    await address.save();
    res.redirect("/address");
  } catch (error) {
    console.log(error.message);
  }
};

const editUserPage = async (req, res) => {
  const userData = req.session.user;

  res.render("userViews/edituser", { userData });
};

const editUserpost = async (req, res) => {
  const id = req.query.id;
  console.log(id);
  console.log(req.body.name);
  const userData = await User.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
      },
    },
    { new: true }
  );
  req.session.user = userData;

  console.log(req.session.user);

  res.redirect("/profile");
};

const addToCart = async (req, res) => {
  try {
    const userData = req.session.user;

    const productId = req.body.id;
    if (userData) {
      const userId = userData._id;

      const product = await Product.findById(productId);

      const existed = await User.findOne({
        _id: userId,
        "cart.product": productId,
      });
      const user = await User.findOne({ _id: userId }).populate("cart.product");
      const cart = user.cart;

      if (existed) {
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: userId,
            "cart.product": productId,
          },
          {
            $inc: {
              "cart.$.quantity": 1,
            },
          },
          { new: true }
        );
        req.session.user = updatedUser;
        const userData = req.session.user;

        res.render("userViews/productDetail", {
          userData: userData,
          products: product,
        });
      } else {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              cart: {
                product: product._id,
              },
            },
          },
          { new: true }
        );
        req.session.user = updatedUser;

        const userData = req.session.user;
        console.log(userData.cart[0].product);
        res.render("userViews/productDetail", {
          userData: userData,
          products: product,
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewCart = async (req, res) => {
  try {
    const userData = req.session.user;
    const userId = req.query.id;
    const user = await User.findOne({ _id: userId }).populate("cart.product");
    const cart = user.cart;

    let cartTotal = 0;
    if(cart.length>0)
    {

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const product = item.product;
      const quantity = item.quantity;
      const total = product.price * quantity;
      item.total = total;
      cartTotal += total;
    }

    res.render("userViews/cartview", {
      userData: userData,
      cartItems: cart,
      cartTotal: cartTotal,
    });
  }
  else{
    res.redirect('/product')
  }
  } catch (error) {
    //res.render("error");
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await Address.deleteOne({ _id: id });
    res.redirect("/address");
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

const removeCart = async (req, res) => {
  try {
    if (req.session.user) {
      const userId = req.session.user._id;
      const cartItemId = req.query.id;

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { cart: { product: cartItemId } } },
        { new: true }
      );

      req.session.user = updatedUser;
      const user = await User.findOne({ _id: userId }).populate("cart.product");
      const cart = user.cart;
      let cartTotal = 0;
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const product = item.product;
        const quantity = item.quantity;
        const total = product.price * quantity; // Calculate the total for the current item
        item.total = total; // Add the total to the item object
        cartTotal += total; // Add the total to the cart total variable
      }
      console.log(cartTotal);

      res.render("userViews/cartview", {
        userData: req.session.user,
        cartItems: cart,
        cartTotal,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editAddress = async (req, res) => {
  const userData = req.session.user;
  console.log(userData);
  const addressId = req.query.id;
  console.log(addressId);

  const address = await Address.findById(addressId);
  console.log({ addressId, address });
  res.render("userViews/editaddress", { userData, address });
};

const editAddresspost = async (req, res) => {
  const userData = req.session.user;
  const id = userData._id;
  const addressId = req.query.id;

  await Address.findByIdAndUpdate(
    addressId,
    {
      owner: id,
      name: req.body.name,
      mobile: req.body.mobile,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    },
    { new: true }
  );
  res.redirect("/address");
};

const cartUpdation = async (req, res) => {
  try {
    const userData = req.session.user;
    let data = await User.find(
      { _id: userData._id },
      { _id: 0, cart: 1 }
    ).lean();

    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
    });

    await User.updateOne(
      { _id: userData._id },
      { $set: { cart: data[0].cart } }
    );

    res.json("from backend ,cartUpdation json");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadHome,
  loadSignup,
  createUser,
  verifyLogin,
  loadLogin,
  userLogout,
  otpsubmit,
  profileLoad,
  adressLoad,
  addAdressLoad,
  addAddress,
  editUserPage,
  editUserpost,
  addToCart,
  viewCart,
  deleteUser,
  forgetLoad,
  forgetPostOtp,
  forgetOtpVerify,
  resetPassword,
  removeCart,
  editAddress,
  editAddresspost,
  cartUpdation,
};
