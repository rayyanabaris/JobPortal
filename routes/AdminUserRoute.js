const express = require("express");
const {
  createAdminUser,
    loginAdminUserCtrl,
    loginAdmin,
    getallAdminUser,
    getaAdminUserByID,
    deleteaAdminUser,
    getAdminUser,
    updatedAdminUser,
    logout,
    handleRefreshToken,
    updatePassword,
    getSearchAdminUser,
    
} = require("../controller/AdminUserCtrl");
const {authMiddleware, isAdmin} = require("../middlewares/authMiddleware");
const router = express.Router();
router.post("/register", createAdminUser);
router.post("/login", loginAdminUserCtrl);
router.get("/all", getallAdminUser);
router.get("/filter/", getAdminUser);
router.delete("/delete/:id", deleteaAdminUser);
router.post("/admin-login", loginAdmin);
router.get("/logout", logout);
router.get("/get/:id", getaAdminUserByID);
router.put("/edit/:id", authMiddleware,isAdmin, updatedAdminUser);
router.get("/refresh", handleRefreshToken);
router.put("/password", authMiddleware, updatePassword);
router.get("/search/:key", getSearchAdminUser);


module.exports = router;
