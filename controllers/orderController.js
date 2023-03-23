const User = require("../models/userModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const { use } = require("../routes/users");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Coupon = require("../models/couponModel");
const pdfkit = require("pdfkit");
const fs = require("fs");
const moment = require('moment')


const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

function generateOrderId() {
  const timestamp = Date.now().toString();
  return timestamp;
}

const hbs = require("hbs");
const { findById } = require("../models/userModel");

hbs.registerHelper("eq", function (a, b) {
  return a === b;
});
hbs.registerHelper("formatDate", function (date, format) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
    // timeZone: 'UTC'
  };
  const formattedDate = new Date(date).toLocaleString("en-US", options);
  return formattedDate;
});
hbs.registerHelper("for", function (from, to, incr, block) {
  let accum = "";
  for (let i = from; i <= to; i += incr) {
    accum += block.fn(i);
  }
  return accum;
});

const checkoutPage = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const user = await User.findOne({ _id: userId }).populate("cart.product");

    const cart = user.cart;
    if (cart.length < 1) {
      res.redirect('/product')
    }

    const address = await Address.find({ owner: userId });

    let cartTotal = 0;
    cart.forEach((item) => {
      const product = item.product;
      const quantity = item.quantity;
      const total = product.price * quantity;
      item.total = total;
      cartTotal += total;
    });

    res.render("userViews/checkoutPage", {
      userData: req.session.user,
      address,
      cartItems: cart,
      cartTotal,
    });
  } catch (error) {
    console.log(error.message);
    res.render("error");
  }
};

const orderSummary = async (req, res) => {
  try {

    const { address, cartTotal, paymentMode, discount } = req.body
    const orderDate = new Date();
    const formattedDate = moment(orderDate).format('DD-MM-YYYY');
    console.log(formattedDate,'daaaaaaaaaaaaaaaaa pattiiiiiiiiii')
    const userData = req.session.user;
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("cart.product");

    const cartItems = user.cart.map((item) => {
      return {
        product: item.product._id,
        quantity: item.quantity,
      };
    });
    if (paymentMode == "cashondelivery") {
      const orderId = generateOrderId();

      if (user.cart.length > 0) {
        const order = new Order({
          owner: userData._id,
          address: address,
          items: cartItems,
          paymentMode: paymentMode,
          orderBill: cartTotal,
          discount: discount,
          orderDate:formattedDate,
          orderId: orderId,
        });
        await order.save();
        for (const item of cartItems) {
          const productId = item.product._id;
          const quantity = item.quantity;
          const product = await Product.findById(productId);
          product.stock -= quantity;
          await product.save();
        }

        user.cart = [];
        const newuserData = await user.save();
        req.session.user = newuserData;
        res.json(order);
      } else {
        res.redirect("/product");
      }
    } else {
      const orderId = generateOrderId();
      if (user.cart.length > 0) {
        const order = new Order({
          owner: userData._id,
          address: address,
          items: cartItems,
          paymentMode: req.body.paymentMethod,
          orderBill: req.body.cartTotal,
          discount: discount,
          orderDate:formattedDate,
          orderId: orderId,
        });
        await order.save();
        for (const item of cartItems) {
          const productId = item.product._id;
          const quantity = item.quantity;
          const product = await Product.findById(productId);
          product.stock -= quantity;
          await product.save();
        }

        //user.cart = [];
        //const newuserData = await user.save();
        //req.session.user = newuserData;

        //res.redirect('/payments')
        res.json(order);


      } else {
        res.redirect("/product");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewOrders = async (req, res) => {
  try {
    const pageNum = req.query.page;
    const Perpage = 3;

    const userData = req.session.user;
    const orderData = await Order.find({
      owner: userData._id,
      status: { $nin: ["returned"] },
    })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * Perpage)
      .limit(Perpage);
    const orderCount = await Order.find({
      owner: userData._id,
      status: { $nin: ["returned"] },
    }).count();
    console.log(orderCount);

    res.render("userViews/viewOrders", {
      orderData: orderData,
      userData: userData,
      orderCount: orderCount,
      currentPage: pageNum,
      pages: Math.ceil(orderCount / Perpage),
    });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentLoad = async (req, res) => {
  try {


    const userData = req.session.user;
    // const orderData= await Order.findOne({owner:userData._id}).populate("items.product").populate("address")

    const userId = req.session.user._id;
    const user = await User.findOne({ _id: userId }).populate("cart.product");
    const order = await Order.findOne({ owner: userId }).sort({ createdAt: -1 })


    res.render("userViews/paymentPage", { userData: userData, order });
  } catch (error) {
    console.log(error.message)

  }
}

const payment = async (req, res) => {
  console.log(req.body);
  const { amount, currency } = req.body;
  console.log(amount, currency)
  var options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: currency,
    receipt: "order_rcptid_1",
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send({ orderId: order.id });
  });
};

const verifyPayment = async (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;
  console.log(body);

  var expectedSignature = crypto
    .createHmac("sha256", "KkAXvkunE3WzLphvq5OJ6cHE")
    .update(body.toString())
    .digest("hex");
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  var response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
};

const orderSuccess = async (req, res) => {
  const userData = req.session.user;
  res.render("userViews/orderSummary", { userData });
};
const orderDetails = async (req, res) => {
  const userData = req.session.user;

  const orderId = req.query.id;
  console.log(orderId);
  const orderData = await Order.findById(orderId)
    .populate("items.product")
    .populate("address");
  console.log(orderData);

  res.render("userViews/orderDetails", { userData, orderData });
};

const cancellOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;


    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "cancelled" },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "returned" },
      { new: true }
    );
    console.log(updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const couponApply = async (req, res) => {
  try {
    const userData = req.session.user;
    const { code, cartTotal } = req.body;
    console.log(code, cartTotal);

    const coupon = await Coupon.findOne({ code: code });
    if (!coupon) {
      return res.status(400).json({ error: "Invalid coupon code" });
    }

    const couponDiscount = coupon.value;
    if (coupon.usedby.includes(userData._id)) {
      return res
        .status(400)
        .json({ error: "Coupon has already been used by the same user" });
    }

    if (cartTotal > 499) {
      const discount = cartTotal * (couponDiscount / 100);
      const data = Math.floor(cartTotal - discount);
      console.log(data);

      coupon.usedby.push(userData._id);
      await coupon.save();

      res.json({ cartTotal: data, discount: discount });
    } else {
      res.status(400).json({ error: "Cart total must be greater than 499" });
    }
  } catch (error) {
    console.log(error);
  }
};
const pastOrder = async (req, res) => {
  try {
    const pageNum = req.query.page;
    const Perpage = 3;

    const userData = req.session.user;
    const pastOrder = await Order.find({
      owner: userData._id,
      status: { $in: ["returned"] },
    })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * Perpage)
      .limit(Perpage);

    const orderCount = await Order.find({
      owner: userData._id,
      status: { $in: ["returned"] },
    }).count();
    res.render("userViews/pastOrders", {
      pastOrder,
      userData,
      orderCount: orderCount,
      currentPage: pageNum,
      pages: Math.ceil(orderCount / Perpage),
    });
  } catch (error) {
    console.log(error.message);
  }
};


const invoicedown = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userData = req.session.user
    const user = await User.findOne({ _id: userData._id })
    console.log(user)

    // Retrieve invoice data
    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("address");

    // Create PDF document
    const doc = new pdfkit();

    // Add invoice header
    doc.text(`Invoice for order #${order.orderId}`);

    // Add order details
    doc.text(`Order Date: ${order.createdAt}`);
    doc.text(`Name: ${user.name}`);

    doc.text(`Shipping Address: ${order.address.address1}, ${order.address.city}, ${order.address.state}`);
    doc.moveDown();

    // Add item table
    doc.text("Product", 50, 200).text("Quantity", 250, 200).text("Price", 350, 200).text("Total", 450, 200);
    doc.moveTo(50, 220).lineTo(550, 220).stroke(); // horizontal line

    let y = 240; // starting y-coordinate for the first row
    let total = 0;
    order.items.forEach((item) => {
      const product = item.product;
      const itemName = product.name;
      const itemQuantity = item.quantity;
      const itemPrice = `Rs.${product.price}`;
      const itemTotal = `Rs.${(item.quantity * product.price)}`;

      doc.text(itemName, 50, y).text(itemQuantity, 250, y).text(itemPrice, 350, y).text(itemTotal, 450, y);

      y += 20; // increment y-coordinate for the next row
      total += item.quantity * product.price;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke(); // horizontal line
    doc.text(`Discount Rs.${order.discount}`, 400, y + 20);
    doc.moveTo(50, y).lineTo(550, y).stroke(); // horizontal line
    doc.text(`Grand Total Rs.${(order.orderBill)}`, 385, y + 40);

    // Save PDF to file
    const filename = `invoice-${order.orderId}.pdf`;
    const filepath = `/Users/jijesh/Downloads/${filename}`;

    doc.pipe(fs.createWriteStream(filepath));
    doc.end();

    // Download PDF
    res.download(filepath, filename);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};



//exprts
module.exports = {
  checkoutPage,
  orderSummary,
  viewOrders,
  payment,
  verifyPayment,
  paymentLoad,
  orderSuccess,
  orderDetails,
  cancellOrder,
  returnOrder,
  couponApply,
  pastOrder,
  invoicedown,
};
