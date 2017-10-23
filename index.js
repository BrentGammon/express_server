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
  //var query = client.query("SELECT * FROM test");
});

app.post("/user/sleepData", function(req, res) {
  console.log("sleep data started");
  fs.writeFileSync("sleepData.json", req.body.data);
});

app.post("/user/walkingRunningDistance", function(req, res) {
  console.log("walkingRunningDistance started");
  fs.writeFileSync("walkingRunningDistance.json", req.body.data);
});

app.post("/user/activeEnergyBurned", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const dataModel = req.body.data;
  const values = dataModel.map(item => {
    const data = JSON.parse(item);
    const userID = Object.keys(data)[0];
    const { value } = data[userID].kcal_burned;
    const { start_date_time, end_date_time } = data[
      userID
    ].effective_time_frame.time_interval;

    return [userID, value, start_date_time, end_date_time];
  });

  const query = format(
    "INSERT INTO activeenergyburned (userid, total, startdate, enddate) VALUES %L",
    values
  );
  //const data = await client.query(query);
  await client.end();
  res.send(true);
});

app.post("/user/flightsClimbed", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const dataModel = req.body.data;
  const values = dataModel.map(item => {
    const data = JSON.parse(item);
    const userID = Object.keys(data)[0];
    const count = data[userID].count;
    const { date_time } = data[userID].effective_time_frame;
    //console.log(date_time);
    return [userID, count, date_time];
  });
  //console.log(values);
  const query = format(
    "INSERT INTO flightsclimbed (userid, total, collectiondate) VALUES %L",
    values
  );
  //const data = await client.query(query);
  await client.end();
  res.send(true);
});

app.post("/user/stepCounter", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const dataModel = req.body.data;

  const values = dataModel.map(item => {
    const data = JSON.parse(item);
    const userID = Object.keys(data)[0];
    const total = data[userID].step_count;
    const { start_date_time, end_date_time } = data[
      userID
    ].effective_time_frame.time_interval;

    return [userID, total, start_date_time, end_date_time];
  });

  const query = format(
    "INSERT INTO stepcounter (userid, total, startdate, enddate) VALUES %L",
    values
  );

  //const data = await client.query(query);
  await client.end();
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

app.listen(3005, function() {
  console.log("Example app listening on port 3005!");
});
