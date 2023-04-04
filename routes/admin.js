const express = require("express");
const router = express.Router();

const productController = require("../controllers/product_controller/productController");
const categoryController = require("../controllers/category_controller/categoryController");
const store = require("../middlewares/multer");
const auth = require("../middlewares/adminAuth");
const loginSignup = require("../controllers/admin_controller/login_signup");
const banner = require("../controllers/admin_controller/banner");
const coupon = require("../controllers/admin_controller/coupon");
const user = require("../controllers/admin_controller/user");
const order = require("../controllers/admin_controller/order");
const dashboard = require("../controllers/admin_controller/dashboard");
router.get("/", loginSignup.adminLogin);
router.post("/", auth.isAdminLogout,loginSignup.verifyAdminLogin);
router.get("/signup",auth.isAdminLogout, loginSignup.loadSignup);
router.post("/signup",auth.isAdminLogout, loginSignup.createAdmin);
router.get("/home", auth.isAdminLogin, dashboard.loadDashboard);
router.get("/logout", auth.isAdminLogin, loginSignup.logout);
router.get("/userList", auth.isAdminLogin, user.userList);
router.get("/block/:id",auth.isAdminLogin, user.blockUser);
router.get("/product", auth.isAdminLogin, productController.getAllProducts);
router.get(
  "/product/edit/:id",
  auth.isAdminLogin,
  productController.editProductLoad
);
router.post(
  "/product/edit/:id",auth.isAdminLogin,
  store.array("image", 5),
  productController.updateProduct
);
router.get(
  "/product/addproduct",
  auth.isAdminLogin,
  productController.addProductLoad
);
//router.post('/product/addproduct',store.single('image'),productController.addProduct)
router.post(
  "/product/addproduct",
  auth.isAdminLogin,
  store.array("images", 5),
  productController.addProduct
);
router.get("/category", auth.isAdminLogin, categoryController.getCategoryList);
router.get(
  "/category/addcategory",
  auth.isAdminLogin,
  categoryController.addCategoryLoad
);
router.post(
  "/category/addcategory",
  auth.isAdminLogin,
  store.single("image"),
  categoryController.createCategory
);
router.get(
  "/category/edit/:id",
  auth.isAdminLogin,
  categoryController.editCategoryLoad
);
router.post(
  "/category/edit/:id",
  auth.isAdminLogin,
  store.single("image"),
  categoryController.updateCategory
);
router.get("/delete/:id", auth.isAdminLogin, categoryController.deleteCategory);
router.get(
  "/product/block/:id",
  auth.isAdminLogin,
  productController.blockProduct
);
router.get("/coupon", auth.isAdminLogin,coupon.couponPage);
router.get("/create-coupon",auth.isAdminLogin, coupon.createCouponLoad);
router.post("/create-coupon",auth.isAdminLogin, coupon.createCoupon);
router.get("/order-list",auth.isAdminLogin, order.orderList);
router.post("/change-status",auth.isAdminLogin, order.changeStatus);
router.get("/delete-coupon/:id",auth.isAdminLogin, coupon.deleteCoupon);
router.get("/edit-coupon/:id",auth.isAdminLogin, coupon.editCoupon);
router.post("/edit-coupon/:id",auth.isAdminLogin, coupon.updateCoupon);
router.get("/banner", auth.isAdminLogin, banner.bannerLoad);
router.get("/create-banner", auth.isAdminLogin, banner.createBannerLoad);
router.post(
  "/create-banner",
  auth.isAdminLogin,
  store.single("image"),
  banner.createBanner
);
router.get("/edit-banner", auth.isAdminLogin, banner.editBannerLoad);
router.post("/edit-banner",auth.isAdminLogin, store.single("image"), banner.editBanner);
router.get("/delete-banner",auth.isAdminLogin, banner.deleteBanner);
router.get("/dashboard",auth.isAdminLogin, dashboard.homeload);
router.get("/shipped",auth.isAdminLogin, order.shippedOrders);
router.get("/order-details",auth.isAdminLogin, order.orderDetailsAdmin);
router.get("/delivered",auth.isAdminLogin, order.deliveredOrders);
router.get("/returned",auth.isAdminLogin, order.returnedOrders);
router.post("/daily-report",auth.isAdminLogin, dashboard.dailysales);
router.get("/dailysales/download",auth.isAdminLogin, dashboard.dailyDownload);
router.post("/monthly-report",auth.isAdminLogin, dashboard.monthlysales);
router.get("/monthlysales/download",auth.isAdminLogin, dashboard.monthlyDownload);
router.post("/yearly-report",auth.isAdminLogin, dashboard.yearlysales);
router.get("/yearlysales/download", dashboard.yearlydownload);

module.exports = router;
