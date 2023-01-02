const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

module.exports.validatePassword = (password, oldHash, salt) => {
  const newHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  console.log(newHash === oldHash, "............isValid");
  return newHash === oldHash;
};

module.exports.hashPassword = (password) => {
  const salt = crypto.randomBytes(32).toString("hex");
  const hashedPwd = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return {
    salt,
    hash: hashedPwd,
  };
};

module.exports.createToken = (payload) => {
  const PRIV_KEY = fs.readFileSync(
    path.join(__dirname, "../", "/keys/PRIV.bem"),
    "utf8"
  );
  const expiresIn = "1d";
  const signedToken = jwt.sign(payload, PRIV_KEY, {
    algorithm: "RS256",
    expiresIn: expiresIn,
  });
  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
};
module.exports.validateToken = (token) => {
  const PUB_KEY = fs.readFileSync(
    path.join(__dirname, "../", "/keys/PUB.bem"),
    "utf8"
  );
  try {
    return jwt.verify(token, PUB_KEY, { algorithms: ["RS256"] });
  } catch (err) {
    return false;
  }
};
