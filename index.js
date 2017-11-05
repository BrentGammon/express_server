const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
//https://stackoverflow.com/questions/9205496/how-to-make-connection-to-postgres-via-node-js
const pg = require("pg");
const conString = "postgres://postgres:password@localhost:5432/fitnessInfo";
const format = require("pg-format");
const moment = require("moment");
const _ = require("lodash");
//console.log(process.argv);

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

app.post("/user/sleepData", async function(req, res) {
  console.log("sleepData");
  if (req.body.data) {
    const dataModel = req.body.data;
    let sleepObject = {};
    let userID = {};

    const values = dataModel.map(item => {
      const data = JSON.parse(item);
      userID = Object.keys(data)[0];
      const endDate = moment(
        data[userID].effective_time_frame.time_interval.end_date_time
      ).format("YYYY-MM-DD");

      if (_.has(sleepObject, endDate)) {
        sleepObject[endDate].push(data);
      } else {
        sleepObject[endDate] = [];
        sleepObject[endDate].push(data);
      }
      return data;
    });
    //console.log("=========================");
    const timeKeys = Object.keys(sleepObject);

    const dataz = timeKeys.map(item => {
      return sleepObject[item].map(items => {
        //console.log(items);

        //start end datetime
        if (items[userID]["metadata"]) {
          return items[userID]["metadata"].map(i => {
            if (i.key === "Asleep") {
              console.log("Asleep");
              const sleepValue = i["value"];
              return {
                [item]: { sleepDuration: sleepValue },
                startTime:
                  items[userID]["effective_time_frame"]["time_interval"][
                    "start_date_time"
                  ],
                endTime:
                  items[userID]["effective_time_frame"]["time_interval"][
                    "end_date_time"
                  ]
              };
            }
            if (i.key === "Average HR") {
              console.log("heart_rate");
              const ahr = i["value"];
              return {
                [item]: { ahr: ahr },
                startTime:
                  items[userID]["effective_time_frame"]["time_interval"][
                    "start_date_time"
                  ],
                endTime:
                  items[userID]["effective_time_frame"]["time_interval"][
                    "end_date_time"
                  ]
              };
            }
            if (i.key === "Deep Sleep") {
              const deepSleep = i["value"];
              return {
                [item]: { deepSleep: deepSleep },
                startTime:
                  items[userID]["effective_time_frame"]["time_interval"][
                    "start_date_time"
                  ],
                endTime:
                  items[userID]["effective_time_frame"]["time_interval"][
                    "end_date_time"
                  ]
              };
            }
          });
        } else {
          const sleepValue = items[userID]["sleep_duration"]["value"];
          return [
            {
              [item]: { sleepDuration: sleepValue },
              startTime:
                items[userID]["effective_time_frame"]["time_interval"][
                  "start_date_time"
                ],
              endTime:
                items[userID]["effective_time_frame"]["time_interval"][
                  "end_date_time"
                ]
            }
          ];
        }
      });
    });

    let sleepArray = [];
    let deepSleepArray = [];
    let sleepHeartRateArray = [];
    dataz.forEach(item => {
      item.forEach(item => {
        if (item) {
          //console.log(item);
          item.forEach(item => {
            //console.log(item);
            if (item) {
              const objectKeys = Object.keys(item);
              const keyValue = Object.keys(Object.entries(item)[0][1])[0];
              const value = Object.entries(item)[0][1][keyValue];
              const startTime = item.startTime;
              const endTime = item.endTime;
              if (keyValue === "sleepDuration") {
                sleepArray.push([userID, value, startTime, endTime]);
              }

              if (keyValue === "ahr") {
                sleepHeartRateArray.push([userID, value, startTime, endTime]);
              }

              if (keyValue === "deepSleep") {
                deepSleepArray.push([userID, value, startTime, endTime]);
              }
            }
          });
        }
      });
    });
    saveSleepData(sleepArray);
    saveDeepSleepData(deepSleepArray);
    saveSleepHeartRate(sleepHeartRateArray);
  }
});

async function saveSleepData(array) {
  const client = new pg.Client(conString);
  await client.connect();

  const query = format(
    "INSERT INTO sleep (userid, duration, startdate, enddate) VALUES %L",
    array
  );
  const data = await client.query(query);
  await client.end();
}

async function saveDeepSleepData(array) {
  const client = new pg.Client(conString);
  await client.connect();

  const query = format(
    "INSERT INTO deepSleep (userid, duration, startdate, enddate) VALUES %L",
    array
  );
  const data = await client.query(query);
  await client.end();
}

async function saveSleepHeartRate(array) {
  const client = new pg.Client(conString);
  await client.connect();

  const query = format(
    "INSERT INTO sleepHeartRate (userid, value, startdate, enddate) VALUES %L",
    array
  );
  const data = await client.query(query);
  await client.end();
}

app.post("/user/walkingRunningDistance", async function(req, res) {
  if (req.body.data) {
    const client = new pg.Client(conString);
    await client.connect();
    const dataModel = req.body.data;
    const values = dataModel.map(item => {
      const data = JSON.parse(item);
      const userID = Object.keys(data)[0];
      const total = data[userID].unit_value.value;

      const start_date_time =
        data[userID].effective_time_frame.time_interval.start_date_time;
      const end_date_time =
        data[userID].effective_time_frame.time_interval.end_date_time;

      return [userID, total, start_date_time, end_date_time];
    });

    const query = format(
      "INSERT INTO walkingrunningdistance (userid, total, startdate, enddate) VALUES %L",
      values
    );
    //const data = await client.query(query);
    await client.end();
    res.send(true);
  }
});

app.post("/user/activeEnergyBurned", async function(req, res) {
  //console.log("activeEnergyBurned");
  if (req.body.data) {
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
    //console.log(values);
    const query = format(
      "INSERT INTO activeenergyburned (userid, total, startdate, enddate) VALUES %L",
      values
    );
    //const data = await client.query(query);
    await client.end();
    res.send(true);
  }
});

app.post("/user/flightsClimbed", async function(req, res) {
  //console.log("flightsClimbed");
  if (req.body.data) {
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
  }
});

app.post("/user/stepCounter", async function(req, res) {
  if (req.body.data) {
    console.log("stepCounter");
    console.log("+=============================");
    console.log(req.body.data);
    console.log("+=============================");
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

    const data = await client.query(query);
    await client.end();
    res.send(true);
  }
});

app.post("/user/heartrate", async function(req, res) {
  if (req.body.data) {
    //console.log("heartrate");
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

    //const data = await client.query(query);
    await client.end();
  }
});

app.post("/user/mood", async function(req, res) {
  const { uid, stress, tiredness, active, alert, happy, energy, calm, healthy } = req.body.user;
  console.log(req.body.user);
  const date = req.body.date;
  if (uid) {
    //console.log("here");
    const client = new pg.Client(conString);
    await client.connect();
    values = [[uid, stress, tiredness, healthy, active, alert, happy, energy, calm, date]];
    const query = format(
      "INSERT INTO userinput (userid, stresslevel, tirednesslevel, healthinesslevel, activitylevel, alertnesslevel, " +
      "happinesslevel, energylevel, calmnesslevel, collectiondate) VALUES %L",
      values
    );
    //console.log(query);
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
  //console.log(data.rows[0]);
  res.send(data.rows[0]);
});

app.get("/user/lastSync/:userid", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const userid = req.params.userid;
  const query = format("SELECT lastSync FROM userid WHERE userid = %L", userid);
  const data = await client.query(query);
  await client.end();
  res.send(data.rows);
});

app.post("/user/lastSync/:userid", async function(req, res) {
  console.log("here");
  const client = new pg.Client(conString);
  await client.connect();
  const userid = req.params.userid;
  const values = [new Date().toISOString(), userid];
  const query = format(
    "UPDATE userid SET lastSync = %L WHERE userid = %L",
    new Date().toISOString(),
    userid
  );
  //console.log(query);
  const data = await client.query(query);
  await client.end();
  res.send(true);
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
