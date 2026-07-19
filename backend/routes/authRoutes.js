const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { login, logout, me } = require("../controllers/authController");

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
