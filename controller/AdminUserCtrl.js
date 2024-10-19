const AdminUser = require("../models/AdminUserModel");
const asyncHandler = require("express-async-handler");

const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Create a AdminUser ----------------------------------------------

const createAdminUser = asyncHandler(async (req, res) => {
  /**
   * TODO:Get the email from req.body
   */
  const email = req.body.email;
  /**
   * TODO:With the help of email find the AdminUser exists or not
   */
  const findAdminUser = await AdminUser.findOne({ email: email });

  if (!findAdminUser) {
    /**
     * TODO:if AdminUser not found AdminUser create a new AdminUser
     */
    const newAdminUser = await AdminUser.create(req.body);
    res.json(newAdminUser);
  } else {
    /**
     * TODO:if AdminUser found then thow an error: AdminUser already exists
     */
    throw new Error("Admin User Already Exists");
  }
});

// Login a AdminUser
const loginAdminUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if AdminUser exists or not
  const findAdminUser = await AdminUser.findOne({ email });
  if (findAdminUser && (await findAdminUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdminUser?._id);
    const updateAdminUser = await AdminUser.findByIdAndUpdate(
      findAdminUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdminUser?._id,
      firstname: findAdminUser?.firstname,
      lastname: findAdminUser?.lastname,
      email: findAdminUser?.email,
      mobile: findAdminUser?.mobile,
      token: generateToken(findAdminUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// Admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if AdminUser exists or not
  const findAdmin = await AdminUser.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateAdminUser = await AdminUser.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const AdminUser = await AdminUser.findOne({ refreshToken });
  if (!AdminUser)
    throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || AdminUser.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(AdminUser?._id);
    res.json({ accessToken });
  });
});

// Logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const AdminUser = await AdminUser.findOne({ refreshToken });
  if (!AdminUser) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await AdminUser.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a AdminUser
const updatedAdminUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedAdminUser = await AdminUser.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedAdminUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Update AdminUsers Password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.AdminUser;
  const { password } = req.body;
  validateMongoDbId(_id);
  const Adminuser = await AdminUser.findById(_id);
  if (password) {
    Adminuser.password = password;
    const updatedPassword = await AdminUser.save();
    res.json(updatedPassword);
  } else {
    res.json(Adminuser);
  }
});

// Get all Filter AdminUsers Data
const getAdminUser = asyncHandler(async (req, res) => {
  try {
    const getAdminUsers = await AdminUser.find(req.query);
    res.json(getAdminUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all AdminUsers
const getallAdminUser = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalAdminUser = await AdminUser.countDocuments();
    const totalPages = Math.ceil(totalAdminUser / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const getAdminUsers = await AdminUser.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("firstname : 1");

    return res.status(200).json({
      success: true,
      msg: "Admin Users List",
      data: getAdminUsers,
      page,
      nextPage,
      totalPages,
      totalAdminUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single AdminUser
const getaAdminUserByID = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaAdminUser = await AdminUser.findById(id);
    res.json({
      getaAdminUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a single AdminUser
const deleteaAdminUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaAdminUser = await AdminUser.findByIdAndDelete(id);
    res.json({
      deleteaAdminUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Search a single AdminUser
const getSearchAdminUser = asyncHandler(async (req, res) => {
  try {
    const getSearchAdminUser = await AdminUser.find({
      $or: [
        { firstname: { $regex: req.params.key } },
        { lastname: { $regex: req.params.key } },
        { email: { $regex: req.params.key } },
        { mobile: { $regex: req.params.key } },
      ],
    });
    res.json(getSearchAdminUser);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createAdminUser,
  loginAdminUserCtrl,
  loginAdmin,
  getallAdminUser,
  getaAdminUserByID,
  deleteaAdminUser,
  updatedAdminUser,
  logout,
  getAdminUser,
  handleRefreshToken,
  updatePassword,
  getSearchAdminUser,
};
