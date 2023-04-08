const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const hbs = require("hbs");

// define a helper function
hbs.registerHelper("calculateItemPrice", function (item) {
  return item.product.price * item.quantity;
});


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

        res.render("userViews/productDetail", {
          userData: userData,
          products: product,
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const viewCart = async (req, res) => {
  try {
    const userData = req.session.user;
    const userId = req.query.id;
    const user = await User.findOne({ _id: userId }).populate("cart.product");
    const cart = user.cart;

    let cartTotal = 0;

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

  } catch (error) {
    res.status(500).send(`${error.message}`);
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


      res.render("userViews/cartview", {
        userData: req.session.user,
        cartItems: cart,
        cartTotal,
      });
    } else {
      throw new Error('User not logged in');
    }
  } catch (error) {

    res.status(500).send('An error occurred while removing item from cart');
  }
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
    res.status(500).send({message:`${error}`})
  }
};

module.exports = { cartUpdation, removeCart, addToCart, viewCart };
