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
    res.json({ auth: req.auth || null, users });
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

module.exports.changePassword = (req, res) => {
  const { password } = req.body;
  User.findOne({ where: { id: req.auth.user.id || null } })
    .then((user) => {
      const { salt, hash } = hashPassword(password);
      User.update(
        { pwd: hash, salt },
        {
          where: {
            id: req.auth.user.id || null,
          },
        }
      )
        .then((updatedUser) => {
          res.json({ updatedUser, msg: "SUCCESS", ctx: "KEEP YOUR TOKEN" });
        })
        .catch((err) => {
          res.status(500).json({ msg: "ERROR UPDATING creds--in DB" });
        });
    })
    .catch((err) => {
      return res.status(400).json({
        err: true,
        msg: "Cannot change password for a non-existent user",
      });
    });
};

module.exports.checkIfAuthenticated = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    req.auth = {
      user: null,
      isAuthenticated: false,
    };
    // return next();
    return res.json({ msg: "NOT AUTHORIZED TO DO SO" });
  }
  const token = authorization.split(" ")[1];

  const tokenIsValid = validateToken(token);
  if (!tokenIsValid) {
    req.auth = {
      user: null,
      isAuthenticated: false,
    };
    return res.json({ msg: "NOT AUTHORIZED TO DO SO" });
  }

  req.auth = {
    user: {
      id: tokenIsValid.sub,
      username: tokenIsValid.username,
    },
    isAuthenticated: true,
  };
  return next();
};
