const express = require("express");
const cors = require("cors");

const router = require("./routes/index");
const { validateToken } = require("./lib/authUtils");
const app = express();
app.use(express.json());
app.use(cors());

const checkAndVerifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    req.auth = {
      user: null,
      isAuthenticated: false,
    };
    return next();
  }
  const token = authorization.split(" ")[1];

  const tokenIsValid = validateToken(token);
  if (!tokenIsValid) {
    req.auth = {
      user: null,
      isAuthenticated: false,
    };
    return next();
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

app.use(checkAndVerifyToken);

app.use(router);

app.listen(5000, () => {
  console.log("LISTENING");
});
