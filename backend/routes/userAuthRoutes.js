const express    = require("express");
const router     = express.Router();
const ctrl       = require("../controllers/userAuthController");
const requireUser = require("../middleware/requireUser");

router.post("/register",        ctrl.register);
router.post("/login",           ctrl.login);
router.post("/logout",          ctrl.logout);
router.post("/logout-all",      requireUser, ctrl.logoutAll);
router.get("/me",               requireUser, ctrl.me);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/verify-otp",      ctrl.verifyOtp);
router.post("/reset-password",  ctrl.resetPassword);

module.exports = router;
