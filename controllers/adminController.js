const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel.js");
const Banner = require("../models/bannerModel");
const Product = require("../models/productModel");
const Category=require("../models/categoryModel");

const ExcelJS = require("exceljs");
const bcrypt = require("bcrypt");
const moment = require("moment");
const hbs = require("hbs");

let dailyorders;
let totalOrderBill;
let monthlyOrders;
let totalMonthlyBill;
let yearlyorders;
let totalYearlyBill;

hbs.registerHelper("formatDate", function (date, format) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const formattedDate = new Date(date).toLocaleString("en-US", options);
  return formattedDate;
});

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const blockfun = async (paramsId) => {
  const abc = await User.findByIdAndUpdate(
    paramsId,
    { $set: { is_blocked: 1 } },
    { new: true }
  );
  return abc;
};
const unblockfun = async (paramsId) => {
  const bcd = await User.findByIdAndUpdate(
    paramsId,
    { $set: { is_blocked: 0 } },
    { new: true }
  );
  return bcd;
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

const loadDashboard = async (req, res) => {
  try {
    const id = req.session.admin_id;

    const adminData = await Admin.findById({ _id: id });

    res.render("adminViews/adminDashboard", { admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};
const logout = async (req, res) => {
  try {
    req.session = null;
    //req.session.destroy();

    console.log("hihuggfgfftffgfgfcgfcfgff");
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};
const userList = async (req, res) => {
  try {
    const usersData = await User.find();
    res.render("adminViews/userList", { usersData });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const blocked = await User.findById(req.params.id);

    const userblocked = blocked.is_blocked;

    if (userblocked) {
      unblockfun(req.params.id);
      res.redirect("/admin/userList");
    } else {
      blockfun(req.params.id);

      res.redirect("/admin/userList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const couponPage = async (req, res) => {
  const coupon = await Coupon.find();

  res.render("adminViews/couponlist", { couponData: coupon });
};

const createCouponLoad = async (req, res) => {
  res.render("adminViews/createCoupon");
};
const createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.redirect("/admin/coupon");
};

const orderList = async (req, res) => {
  const orderData = await Order.find()
    .populate("items.product")
    .populate("address")
    .sort({ createdAt: -1 });
  res.render("adminViews/orderList", { orderData: orderData });
};
const changeStatus = async (req, res) => {
  try {
    const id = req.body.id;

    const status = req.body.status;

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status: status } },
      { new: true }
    );
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
};
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.redirect("/admin/coupon");
  } catch (error) {
    console.log(error);
    res.render("error");
  }
};
const editCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);
    res.render("adminViews/editcoupon", { coupon });
  } catch (error) {}
};
const updateCoupon = async (req, res) => {
  try {
    const couponData = req.body;

    await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: req.body.code,
        value: req.body.value,
        minBill: req.body.minBill,
        ...(req.body.expiryDate && { expiryDate: req.body.expiryDate }),
        status: req.body.status,
      },
      { new: true }
    );
    res.redirect("/admin/coupon");
  } catch (error) {
    res.render("error");
  }
};

const bannerLoad = async (req, res) => {
  const banner = await Banner.find();

  res.render("adminViews/banner", { banner });
};

const createBannerLoad = async (req, res) => {
  res.render("adminViews/createBanner");
};

const createBanner = async (req, res) => {
  const file = req.file;
  const fileName = file.filename;

  try {
    const banner = new Banner({
      title: req.body.title,
      description: req.body.description,
      image: fileName,
      linkUrl: req.body.linkUrl,
      status: req.body.status,
    });
    await banner.save();

    res.redirect("/admin/banner");
  } catch (error) {
    res.render("error");
  }
};

const editBannerLoad = async (req, res) => {
  try {
    const banner = await Banner.findById(req.query.id);

    res.render("adminViews/editBanner", { banner: banner });
  } catch (error) {
    console.log(error.message);
  }
};
const editBanner = async (req, res) => {
  try {
    const bannerId = req.query.id;
    const bannerImg = await Banner.findById(bannerId);
    const exstImg = bannerImg.image;

    let upImage;

    const file = req.file;
    //  const fileName = file.filename
    //  const basePath = '/images/';

    if (file) {
      const newImage = file.filename;
      upImage = newImage;
      bannerImg.image = upImage;
    } else {
      upImage = exstImg;
    }

    await Banner.findByIdAndUpdate(
      bannerId,
      {
        title: req.body.title,
        description: req.body.description,
        image: upImage,
        linkUrl: req.body.linkUrl,
        status: req.body.status,
      },
      { new: true }
    );

    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error);
  }
};

const deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.query.id);
  res.redirect("/admin/banner");
};
const homeload = async (req, res) => {
  const users = await User.find({}).count();
  const products = await Product.find({}).count();
  const orders = await Order.find({}).count();
  const totalRevenue = await Order.find({ status: "delivered" });
  const categories = await Category.find({}, '_id');
  const categoryIds = categories.map(category => category._id);
  console.log(categoryIds)
  const cashOnDeliveryCount = await Order.countDocuments({
    paymentMode: "cashondelivery",
  });
  const razorPayCount = await Order.countDocuments({ paymentMode: "razorpay" });

  const pipeline = [
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: 1,
          },
        },
        count: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ];
  const ordersByMonth = await Order.aggregate(pipeline);
  const orderCounts = ordersByMonth.map(({ date, count }) => ({
    month: date.toLocaleString("default", { month: "long" }),
    count,
  }));

  res.render("adminViews/adminhome", {
    cashOnDeliveryCount,
    razorPayCount,
    orderCounts,
    users,
    products,
    orders,
    totalRevenue,
  });
};

const shippedOrders = async (req, res) => {
  try {
    res.json(
      await Order.find({ status: "shipped" })
        .populate("items.product")
        .populate("address")
        .sort({ createdAt: -1 })
    );
  } catch (error) {
    console.log(error);
  }
};

const orderDetailsAdmin = async (req, res) => {
  try {
    const orderId = req.query.id;

    const orderData = await Order.findById(orderId)
      .populate("items.product")
      .populate("address");

    res.render("adminViews/orderDetailsAdmin", { orderData });
  } catch (error) {
    console.log(error);
  }
};

const deliveredOrders = async (req, res) => {
  try {
    res.json(
      await Order.find({ status: "delivered" })
        .populate("items.product")
        .populate("address")
        .sort({ createdAt: -1 })
    );
  } catch (error) {
    console.log(error);
  }
};
const returnedOrders = async (req, res) => {
  try {
    res.json(
      await Order.find({ status: "returned" })
        .populate("items.product")
        .populate("address")
        .sort({ createdAt: -1 })
    );
  } catch (error) {
    console.log(error);
  }
};

const dailysales = async (req, res) => {
  const orderDate = req.body.daily;
  const oDate = moment(orderDate).format("DD-MM-YYYY");
  dailyorders = await Order.find({ orderDate: oDate }).populate("address");
  totalOrderBill = dailyorders.reduce(
    (total, order) => total + Number(order.orderBill),
    0
  );

  res.render("adminViews/dailysales", { dailyorders, totalOrderBill });
};
const dailyDownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Delivery Name", key: "deliveryName", width: 20 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  dailyorders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      deliveryName: order.address.name,
      orderDate: order.orderDate,
      discount: order.discount,
      totalBill: order.orderBill,
    });
  });
  worksheet.addRow({
    totalOrders: dailyorders.length,
    totalRevenue: totalOrderBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("An error occurred while generating the Excel file");
    });
};
const monthlysales = async (req, res) => {
  try {
    const monthinput = req.body.month;
    const year = parseInt(monthinput.substring(0, 4));
    const month = parseInt(monthinput.substring(5));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $sort: {
          orderDate: 1, // Sort the documents by order date in ascending order
        },
      },
    ]);

    totalMonthlyBill = monthlyOrders.reduce(
      (total, order) => total + Number(order.orderBill),
      0
    );

    res.render("adminViews/monthlyOrders", { monthlyOrders, totalMonthlyBill });
  } catch (error) {
    console.log(error.message);
  }
};
const monthlyDownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");

  // Add headers to the worksheet
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  monthlyOrders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      orderDate: order.orderDate,
      discount: order.discount,
      totalBill: order.orderBill,
    });
  });
  worksheet.addRow({
    totalOrders: monthlyOrders.length,
    totalRevenue: totalMonthlyBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("An error occurred while generating the Excel file");
    });
};

const yearlysales = async (req, res) => {
  const orders = await Order.find();

  const year = req.body.yearly;

  yearlyorders = orders.filter(
    (order) => order.createdAt.getFullYear() === parseInt(year)
  );

  totalYearlyBill = yearlyorders.reduce(
    (total, order) => total + Number(order.orderBill),
    0
  );

  res.render("adminViews/yearlyorders", { yearlyorders, totalYearlyBill });
};

const yearlydownload = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales Data");

  // Add headers to the worksheet
  worksheet.columns = [
    { header: "Order ID", key: "orderId", width: 10 },
    { header: "Order Date", key: "orderDate", width: 15 },
    { header: "Discount", key: "discount", width: 10 },
    { header: "Total Bill", key: "totalBill", width: 10 },
    { header: "totalOrders", key: "totalOrders", width: 10 },
    { header: "totalRevenue", key: "totalRevenue", width: 20 },
  ];

  yearlyorders.forEach((order) => {
    worksheet.addRow({
      orderId: order.orderId,
      orderDate: order.orderDate,
      discount: order.discount,
      totalBill: order.orderBill,
    });
  });
  worksheet.addRow({
    totalOrders: yearlyorders.length,
    totalRevenue: totalYearlyBill,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "SalesData.xlsx"
  );

  workbook.xlsx
    .write(res)
    .then(() => {
      res.end();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("An error occurred while generating the Excel file");
    });
};

//exports
module.exports = {
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
  createBanner,
  editBannerLoad,
  editBanner,
  deleteBanner,
  homeload,
  shippedOrders,
  orderDetailsAdmin,
  deliveredOrders,
  returnedOrders,
  dailysales,
  dailyDownload,
  monthlysales,
  monthlyDownload,
  yearlysales,
  yearlydownload,
};
