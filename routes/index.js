const router = require("express").Router();
const { getAllUsers, signUp, logIn } = require("../controllers/index");
router.get("/", (req, res) => {
  res.json({ msg: "ALL_OK", auth: req.auth });
});
router.get("/users", getAllUsers);
router.post("/signup", signUp);
router.post("/logIn", logIn);
module.exports = router;
