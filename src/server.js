const express = require("express");
require("dotenv").config();
const hbs = require("hbs");
require("@babel/core").transform("code", {
  presets: ["@babel/preset-env"],
});
const path = require("path");

// custom imports
import {
  main,
} from "./helpers/gnosis.js";

const app = express();

app.use(express.static("static"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");


main()
  .then(() => {
    //process.exit(0)
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on http://localhost:${process.env.PORT}`);
});
