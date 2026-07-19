const express      = require("express");
const router       = express.Router();
const { getList }  = require("../controllers/emailMarketingController");
const requireAuth  = require("../middleware/requireAuth");

router.get("/", requireAuth, getList);

module.exports = router;
