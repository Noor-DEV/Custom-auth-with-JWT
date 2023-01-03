const express = require("express");
const cors = require("cors");

const router = require("./routes/index");
const { validateToken } = require("./lib/authUtils");
const app = express();
app.use(express.json());
app.use(cors());

app.use(router);

app.listen(5000, () => {
  console.log("LISTENING");
});
