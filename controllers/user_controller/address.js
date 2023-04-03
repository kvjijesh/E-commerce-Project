const User = require("../../models/userModel");
const Address = require("../../models/addressModel");

const adressLoad = async (req, res) => {
  try {
    const userData = req.session.user;
    const id = userData._id;
    const userAddress = await Address.find({ owner: id });

    if (req.session.user) {
      res.render("userViews/adresspage", { userData, userAddress });
    }
  } catch (error) {
    res.status(500).send(error.message)
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
    const {name,mobile,address1,address2,city,state,zip}=req.body
    const address = new Address({
      owner: id,
      name: name,
      mobile: mobile,
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      zip: zip,
    });
    await address.save();
    res.redirect("/address");
  } catch (error) {
    res.status(500).send(error.message)
  }
};

const editAddress = async (req, res) => {
  try {
    const userData = req.session.user;
    const addressId = req.query.id;
    const address = await Address.findById(addressId);
    res.render("userViews/editaddress", { userData, address });
  } catch (error) {
    console.error(error);
  }
};

const editAddresspost = async (req, res) => {
  try {
    const userData = req.session.user;
    const id = userData._id;
    const addressId = req.query.id;
    const {name,mobile,address1,address2,city,state,zip}=req.body

    await Address.findByIdAndUpdate(
      addressId,
      {
        owner: id,
        name: name,
        mobile:mobile,
        address1: address1,
        address2: address2,
        city: city,
        state: state,
        zip: zip,
      },
      { new: true }
    );
    res.redirect("/address");
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  adressLoad,
  addAdressLoad,
  addAddress,
  editAddress,
  editAddresspost,
};
