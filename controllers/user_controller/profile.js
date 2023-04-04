const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const { find, findById } = require("../../models/userModel");
const Category = require("../../models/categoryModel");
const { getAllProducts } = require("../product_controller/productController");
const Address = require("../../models/addressModel");
const Banner = require("../../models/bannerModel");


const loadHome = async (req, res) => {
  try {
    const categories = await Category.find();
    const banner = await Banner.find();
    const products = await Product.find({ is_blocked: false });
    const userData= req.session.user
    if (categories) {
      if (userData) {


        res.render("userViews/home", {
          categories: categories,
          userData: userData,
          banner: banner,
          products,
        });
      } else {
        res.render("userViews/home", {
          categories: categories,
          banner: banner,
          products,
        });
      }
    } else {
      res.send("category does not exist");
    }
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const profileLoad = async (req, res) => {
  try {
    const userData = req.session.user;
    res.render("userViews/userprofile", { userData });
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const editUserPage = async (req, res) => {
  const userData = req.session.user;

  res.render("userViews/edituser", { userData });
};

const editUserpost = async (req, res) => {
  try {
    const id = req.query.id;
    const { name, mobile, email } = req.body;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: name,
          mobile: mobile,
          email: email,
        },
      },
      { new: true }
    );
    req.session.user = userData;



    res.redirect("/profile");
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await Address.deleteOne({ _id: id });
    res.redirect("/address");
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

module.exports = {
  loadHome,
  profileLoad,
  editUserPage,
  editUserpost,
  deleteUser,
};
