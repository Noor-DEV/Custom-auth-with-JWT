const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { User } = require("../models/index");

const {
  validatePassword,
  hashPassword,
  createToken,
  validateToken,
} = require("../lib/authUtils");

module.exports.getAllUsers = (req, res) => {
  User.findAll().then((users) => {
    res.json({ auth: req.auth, users });
  });
};
module.exports.signUp = (req, res) => {
  const { username, password } = req.body;

  User.findOne({ where: { username } }).then((user) => {
    if (user) {
      return res.json({
        msg: "CANNOT REGISTER A USER THAT ALREADY EXISTS, TRY LOGING IN IF IT'S YOU........",
      });
    }
    if (password.trim().length < 6) {
      return res.json({
        msg: "PASSWORD MUST BE ATLEAST 6 CHARACTERS LONG....",
      });
    }
    const { salt, hash } = hashPassword(password);
    return User.create({ username, pwd: hash, salt })
      .then((newUser) => {
        const { token, expires } = createToken({
          sub: newUser.id,
          username: newUser.username,
          iat: Date.now(),
        });
        return res.json({ createdUser: newUser, token, expires });
      })
      .catch((err) => {
        return res.json({
          err,
          errorMsg: err.message,
          msg: "Couldn't create new user....",
          body: req.body,
        });
      });
  });
};

module.exports.logIn = (req, res) => {
  const { username, password } = req.body;
  User.findOne({ where: { username } })
    .then((user) => {
      if (!user) {
        return res.json({ msg: "CAN'T LOGIN, TRY YOUR CREDENTIALS AGAIN" });
      }
      const isValid = validatePassword(password, user.pwd, user.salt);
      if (isValid) {
        const { token, expires } = createToken({
          sub: user.id,
          username: user.username,
          iat: Date.now(),
        });
        return res.json({
          isValid,
          user,
          token,
          expires,
        });
      }
      return res.json({
        msg: "INVALID LOGIN INFO -- Check your login information",
        isValid,
      });
    })
    .catch((err) => {
      return res.json({
        err,
        errMsg: err.message,
        msg: "ERROR LOGING IN--finding the user",
      });
    });
};

module.exports.changePassword = (req, res) => {};
