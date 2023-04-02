const Coupon = require("../../models/couponModel");

const couponPage = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    res.render("adminViews/couponlist", { couponData: coupon });
  } catch (error) {

    res.status(500).send("An error occurred while fetching coupons.");
  }
};


const createCouponLoad = async (req, res) => {
  res.render("adminViews/createCoupon");
};

const createCoupon = async (req, res) => {
  try {
    await Coupon.create(req.body);
    res.redirect("/admin/coupon");
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.redirect("/admin/coupon");
  } catch (error) {

    res.render("error");
  }
};
const editCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);
    res.render("adminViews/editcoupon", { coupon });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};
const updateCoupon = async (req, res) => {
  try {
    const { code, value, minBill, expiryDate, status } = req.body;
    await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code,
        value,
        minBill,
        ...(expiryDate && { expiryDate }),
        status,
      },
      { new: true }
    );

    res.redirect("/admin/coupon");
  } catch (error) {
    console.error(error);
    res.render("error");
  }
};

module.exports = {
  deleteCoupon,
  editCoupon,
  updateCoupon,
  createCoupon,
  createCouponLoad,
  couponPage,
};
