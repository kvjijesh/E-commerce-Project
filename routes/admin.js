const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const store = require("../middlewares/multer");
const auth = require("../middlewares/adminAuth");

router.get("/", adminController.adminLogin);
router.post("/", adminController.verifyAdminLogin);
router.get("/signup", adminController.loadSignup);
router.post("/signup", adminController.createAdmin);
router.get("/home", auth.isAdminLogin, adminController.loadDashboard);
router.get("/logout", adminController.logout);
router.get("/userList", auth.isAdminLogin, adminController.userList);
router.get("/block/:id", adminController.blockUser);
router.get("/product", auth.isAdminLogin, productController.getAllProducts);
router.get(
  "/product/edit/:id",
  auth.isAdminLogin,
  productController.editProductLoad
);
router.post(
  "/product/edit/:id",
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
  store.single("image"),
  categoryController.updateCategory
);
router.get("/delete/:id", auth.isAdminLogin, categoryController.deleteCategory);
router.get(
  "/product/block/:id",
  auth.isAdminLogin,
  productController.blockProduct
);
router.get("/coupon", adminController.couponPage);
router.get("/create-coupon", adminController.createCouponLoad);
router.post("/create-coupon", adminController.createCoupon);
router.get("/order-list", adminController.orderList);
router.post("/change-status", adminController.changeStatus);
router.get("/delete-coupon/:id", adminController.deleteCoupon);
router.get("/edit-coupon/:id", adminController.editCoupon);
router.post("/edit-coupon/:id", adminController.updateCoupon);
router.get("/banner", auth.isAdminLogin, adminController.bannerLoad);
router.get(
  "/create-banner",
  auth.isAdminLogin,
  adminController.createBannerLoad
);
router.post(
  "/create-banner",
  auth.isAdminLogin,
  store.single("image"),
  adminController.createBanner
);
router.get("/edit-banner", auth.isAdminLogin, adminController.editBannerLoad);
router.post("/edit-banner", store.single("image"), adminController.editBanner);
router.get("/delete-banner", adminController.deleteBanner);
router.get("/dashboard",adminController.homeload);
router.get('/shipped',adminController.shippedOrders)
router.get('/order-details',adminController.orderDetailsAdmin)
router.get('/delivered',adminController.deliveredOrders)
router.get('/returned',adminController.returnedOrders)
router.post('/daily-report',adminController.dailysales)
router.get('/dailysales/download',adminController.dailyDownload);
router.post('/monthly-report',adminController.monthlysales)
router.get('/monthlysales/download',adminController.monthlyDownload);
router.post('/yearly-report',adminController.yearlysales)
router.get('/yearlysales/download',adminController.yearlydownload);

module.exports = router;
