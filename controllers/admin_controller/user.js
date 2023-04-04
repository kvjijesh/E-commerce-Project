const User = require("../../models/userModel");
const hbs=require('hbs')
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});
const blockfun = async (paramsId) => {
  try {
    const abc = await User.findByIdAndUpdate(
      paramsId,
      { $set: { is_blocked: "true" } },
      { new: true }
    );
    return abc;
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};
const unblockfun = async (paramsId) => {
  try {
    const bcd = await User.findByIdAndUpdate(
      paramsId,
      { $set: { is_blocked: "false"} },
      { new: true }
    );
    return bcd;
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const userList = async (req, res) => {
  try {
    const usersData = await User.find();
    res.render("adminViews/userList", { usersData });
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

const blockUser = async (req, res) => {
  try {
    const blocked = await User.findById(req.params.id);

    const userblocked = blocked.is_blocked;
    console.log(userblocked,2256,blocked)

    if (userblocked=="true") {
      unblockfun(req.params.id);
      res.redirect("/admin/userList");
    } else if(userblocked=="false") {
      blockfun(req.params.id);

      res.redirect("/admin/userList");
    }
  } catch (error) {
    res.status(500).send({message:`${error}`})
  }
};

module.exports = { userList, blockUser };
