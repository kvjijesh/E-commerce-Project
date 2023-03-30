const Order = require("../../models/orderModel");

const orderList = async (req, res) => {
  try {
    const orderData = await Order.find()
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });
    res.render("adminViews/orderList", { orderData: orderData });
  } catch (error) {
    console.log(error.message);
  }
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

module.exports = {
  shippedOrders,
  orderDetailsAdmin,
  deliveredOrders,
  returnedOrders,
  orderList,
  changeStatus,
};
