const router = require("express").Router();
const {
  getAllUsers,
  signUp,
  logIn,
  checkIfAuthenticated,
  changePassword,
} = require("../controllers/index");
router.get("/", (req, res) => {
  res.json({ msg: "ALL_OK", auth: req.auth });
});
router.get("/users", getAllUsers);
router.post("/signup", signUp);
router.post("/logIn", logIn);
router.patch("/password-change", checkIfAuthenticated, changePassword);
module.exports = router;
