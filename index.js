const express = require("express");
const bodyParser = require("body-parser");
var path = require("path");
var fs = require("fs");

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000000
  })
);
app.use(bodyParser.json({ type: "application/*+json" }));

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.post("/heartrate", function(req, res) {
  let data = req.body.data;
  fs.writeFileSync("heartRateData.json", data);
  //console.log(req.body.data)
  //postman version
  //   JSON.parse(data).map(item => {
  //     console.log("????????????????????????????")
  //     const object = item
  //     const uid = Object.keys(object)[0]
  //     const heartRateData = object[uid].heart_rate
  //     const date = object[uid].effective_time_frame
  //     console.log("User id: " + uid)
  //     console.log("Heart rate: " + heartRateData.value + " " + heartRateData.unit)
  //     console.log("Date: " + date.date_time)
  //     console.log("????????????????????????????")
  //   })

  //ios version
  data.map(item => {
    console.log("????????????????????????????");
    const object = JSON.parse(item);
    const uid = Object.keys(object)[0];
    const heartRateData = object[uid].heart_rate;
    const date = object[uid].effective_time_frame;
    console.log("User id: " + uid);
    console.log(
      "Heart rate: " + heartRateData.value + " " + heartRateData.unit
    );
    console.log("Date: " + date.date_time);
    console.log("????????????????????????????");
  });

  res.send(data);
});

app.post("/sleepData", function(req, res) {
  let data = req.body.data;
  fs.writeFileSync("sleepData.json", data);
});

app.post("/walkingRunningDistance", function(req, res) {
  let data = req.body.data;
  fs.writeFileSync("walkingRunningDistance.json", data);
});

app.post("/activeEnergyBurned", function(req, res) {
  let data = req.body.data;
  fs.writeFileSync("activeEnergyBurned.json", data);
});

app.post("/flightsClimbed", function(req, res) {
  let data = req.body.data;
  fs.writeFileSync("flightsClimbed.json", data);
});

app.post("/stepCounter", function(req, res) {
  let data = req.body.data;
  fs.writeFileSync("stepCounter.json", data);
});

app.listen(3005, function() {
  console.log("Example app listening on port 3005!");
});
