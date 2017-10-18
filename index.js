const express = require("express");
const bodyParser = require("body-parser");
const {Pool, Client} = require('pg');
var path = require("path");
var fs = require("fs");

//pools will use envionment variables for connection info
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'CO600T1',
  password: 'admin',
  port: 5432,
})

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})

const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'CO600T1',
  password: 'admin',
  port: 5432,
})
client.connect();

client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
})

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

app.post("/user/heartrate",async function(req, res) {
  console.log("heart rate started");
  fs.writeFileSync("heartRateData.json", req.body.data);

  var dataModel = req.body.data;

  dataModel.foreach(function(entry){
    var userId = app.get(userId);
    var value = userId.heart_rate.value;
    var data = userId.effective_time_frame.date_time;

  const query = {
    text: 'INSERT INTO heartRate(heartRate, collectionDate) VALUES($1, $2)',
    values: [value, date]
  }
  await client.query(query);
  })

});

app.get("/heartRate", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userId', 'heartrate', 'collectionDate' FROM heartRate");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.post("/user/sleepData", function(req, res) {
  console.log("sleep data started");
  fs.writeFileSync("sleepData.json", req.body.data);
});

app.get("/sleepData", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userId', 'asleep', 'deepSleep', 'averageHeartRate', 'startDate', 'endDate' FROM sleepData");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.post("/user/walkingRunningDistance", function(req, res) {
  console.log("walkingRunningDistance started");
  fs.writeFileSync("walkingRunningDistance.json", req.body.data);
});

app.get("/walkingRunningDistance", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userId', 'total', 'startDate', 'endDate' FROM walkingRunningDistance");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.post("/user/activeEnergyBurned", function(req, res) {
  console.log("activeEnergyBurned started");
  fs.writeFileSync("activeEnergyBurned.json", req.body.data);
});

app.get("/activeEnergyBurned", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userId', 'total', 'startDate', 'endDate' FROM ");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.post("/user/flightsClimbed", function(req, res) {
  console.log("flightsClimbed started");
  fs.writeFileSync("flightsClimbed.json", req.body.data);
});

app.post("/user/stepCounter", function(req, res) {
  console.log("stepCounter started");
  fs.writeFileSync("stepCounter.json", req.body.data);
});

app.listen(3005, function() {
  console.log("Example app listening on port 3005!");
});
