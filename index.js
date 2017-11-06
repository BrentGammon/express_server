const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
//https://stackoverflow.com/questions/9205496/how-to-make-connection-to-postgres-via-node-js
const pg = require("pg");
const conString = "postgres://admin:admin@localhost:5432/fitnessInfo";
const format = require("pg-format");
const moment = require("moment");
const _ = require("lodash");
const get = require("./routes/get");
const post = require("./routes/post");

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.json({ limit: "50mb" }));
app.use(get); //get end points
app.use(post);

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000000
  })
);
app.use(bodyParser.json({ type: "application/*+json" }));
app.use(cors());

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.get("/user/queryPage", async function(req, res){
  console.log("queryPageTest");
  const client = new pg.Client(consString);
  await client.connect();
  const userId = req.params.user.uid;
  const timePeriod = req.params.user.timePeriod;
  const mood = req.params.user.mood;
  const values = [userId, timePeriod, mood];
  const today = moment().format("l");
  let timePeriods; 
  switch(timePeriod){
    case "Today":
    timePeriods = today.subtract(7, 'days').calendar();
    break;

    case "This Week":
    break;

    case "Last Week":
    timePeriods = today.subtract(7, 'days').calendar();
    break;
  }


})

app.listen(3005, function() {
  console.log("Example app listening on port 3005!");
});
