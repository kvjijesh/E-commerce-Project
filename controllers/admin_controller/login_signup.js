const Admin = require("../../models/adminModel");
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
const adminLogin = async (req, res) => {
  try {
    res.render("adminViews/adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};
const createAdmin = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    email = req.body.email;
    
    if(req.body&&email)
    {

    const exist = await Admin.findOne({ email: email });

    if (exist == null) {
      const admin = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: spassword,
        role: req.body.role,
      });
      const adminData = await admin.save();

      if (adminData) {
        res.render("adminViews/adminSignup", {
          message: "Registration successfull Please login",
        });
      } else {
        res.render("adminViews/adminSignup", {
          message: "User Registration failed",
        });
      }
    } else {
      if (exist.email == email) {
        res.render("adminViews/adminSignup", {
          message: "Email already exist",
        });
      }
    }
  }
  else{
    res.render("adminViews/adminSignup",{message:"Empty fields"})
  }
  } catch (error) {
    console.log(error.message);
  }
};
const loadSignup = async (req, res) => {
  try {
    res.render("adminViews/adminSignup");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyAdminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await Admin.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        if (adminData.role == "Admin") {
          req.session.admin_id = adminData._id;

          res.redirect("admin/home");
        } else {
          res.render("adminViews/AdminLogin", {
            message: "Un authorised access !!",
          });
        }
      } else {
        res.render("adminViews/AdminLogin", {
          message: "User name or password incorrect",
        });
      }
    } else {
      res.render("adminViews/AdminLogin", { message: "Admin Not exist !!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const logout = async (req, res) => {
  try {
    req.session = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminLogin,
  createAdmin,
  loadSignup,
  verifyAdminLogin,
  logout,
};
