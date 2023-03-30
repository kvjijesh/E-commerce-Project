const User = require("../../models/userModel");

const blockfun = async (paramsId) => {
  try {
    const abc = await User.findByIdAndUpdate(
      paramsId,
      { $set: { is_blocked: 1 } },
      { new: true }
    );
    return abc;
  } catch (error) {
    console.log(error);
  }
};
const unblockfun = async (paramsId) => {
  try {
    const bcd = await User.findByIdAndUpdate(
      paramsId,
      { $set: { is_blocked: 0 } },
      { new: true }
    );
    return bcd;
  } catch (error) {
    console.log(error);
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

module.exports = { userList, blockUser };
