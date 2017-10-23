const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
//https://stackoverflow.com/questions/9205496/how-to-make-connection-to-postgres-via-node-js
const pg = require("pg");
const conString = "postgres://postgres:password@localhost:5432/fitnessInfo";
const format = require("pg-format");
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
});



app.get("/heartRate", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userid', 'heartrate', 'collectiondate' FROM heartrate");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.get("/sleepData", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userid', 'asleep', 'deepsleep', 'averageheartrate', 'startdate', 'enddate' FROM sleepdata");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.get("/walkingRunningDistance", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userid', 'total', 'startdate', 'enddate' FROM walkingrunningdistance");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.get("/activeEnergyBurned", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userid', 'total', 'startdate', 'enddate' FROM activeenergyburned");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.get("/flightsClimbed", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userid', 'total', 'collectiondate' FROM flightsclimbed");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.get("/stepCounter", async function(req, res){
  await client.connect();
  const data = await client.query("SELECT 'userid', 'total', 'startdate', 'enddate' FROM stepcounter");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
})

app.get("/test", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const data = await client.query("SELECT * FROM userid");
  await client.end();
  console.log(data.rows[0]);
  res.send(data.rows[0]);
});

app.get("/user/:userid", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const userId = req.params.userid;
  const values = [userId];
  const query = format("SELECT userId FROM userid WHERE userid = %L", userId);
  const data = await client.query(query);
  await client.end();
  const response = data.rows;
  res.send(response.length == 0 ? false : true);
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

app.post("/user/mood", async function(req, res) {
  const { uid, stress, tiredness, active, healthy } = req.body.user;
  const date = req.body.date;

  if (uid) {
    console.log("here");
    const client = new pg.Client(conString);
    await client.connect();
    values = [[uid, stress, tiredness, healthy, active, date]];
    const query = format(
      "INSERT INTO userinput (userid, stresslevel,tirednesslevel,healthinesslevel,activitylevel ,collectiondate) VALUES %L",
      values
    );
    console.log(query);
    const data = await client.query(query);
    await client.end();
  }
  res.send(true);
});


app.post("/user/heartrate", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const dataModel = req.body.data;
  const values = dataModel.map(item => {
    const data = JSON.parse(item);
    const userID = Object.keys(data)[0];
    const value = data[userID].heart_rate.value;
    const timestamp = data[userID].effective_time_frame.date_time;
    return [userID, value, timestamp];
  });

  const query = format(
    "INSERT INTO heartrate (userid, heartrate, collectiondate) VALUES %L",
    values
  );

  fs.writeFileSync("data.sql", query); //temp item to create data for nik

  const data = await client.query(query);
  await client.end();
});


app.listen(3005, function() {
  console.log("Example app listening on port 3005!");
});
