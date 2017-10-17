const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
//https://stackoverflow.com/questions/9205496/how-to-make-connection-to-postgres-via-node-js
const pg = require("pg");
const conString = "postgres://postgres:password@localhost:5432/fitnessInfo";

console.log(process.argv);

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
app.use(cors());
app.get("/", function(req, res) {
  res.send("Hello World!");
  var query = client.query("SELECT * FROM test");
});

app.post("/user/heartrate", function(req, res) {
  console.log("heart rate started");
  fs.writeFileSync("heartRateData.json", req.body.data);
});

app.post("/user/sleepData", function(req, res) {
  console.log("sleep data started");
  fs.writeFileSync("sleepData.json", req.body.data);
});

app.post("/user/walkingRunningDistance", function(req, res) {
  console.log("walkingRunningDistance started");
  fs.writeFileSync("walkingRunningDistance.json", req.body.data);
});

app.post("/user/activeEnergyBurned", function(req, res) {
  console.log("activeEnergyBurned started");
  fs.writeFileSync("activeEnergyBurned.json", req.body.data);
});

app.post("/user/flightsClimbed", function(req, res) {
  console.log("flightsClimbed started");
  fs.writeFileSync("flightsClimbed.json", req.body.data);
});

app.post("/user/stepCounter", function(req, res) {
  console.log("stepCounter started");
  fs.writeFileSync("stepCounter.json", req.body.data);
});

app.post("/user/mood", function(req, res) {
  res.send({ ok: "mate" });
  console.log(req.body);
});

app.get("/test", async function(req, res) {
  var client = new pg.Client(conString);
  await client.connect();
  const data = await client.query("SELECT * FROM userid");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
});

app.listen(3005, function() {
  console.log("Example app listening on port 3005!");
});
