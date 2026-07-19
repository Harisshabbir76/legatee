const express     = require("express");
const router      = express.Router();
const ctrl        = require("../controllers/userController");
const requireUser = require("../middleware/requireUser");

router.use(requireUser);

router.get("/profile",              ctrl.getProfile);
router.put("/profile",              ctrl.updateProfile);
router.put("/email-marketing",      ctrl.toggleEmailMarketing);
router.get("/orders",               ctrl.getOrders);

module.exports = router;
