const routes = require("express").Router();
const pg = require("pg");
const conString = "postgres://postgres:password@localhost:5432/fitnessInfo";
const format = require("pg-format");
const moment = require("moment");
moment.locale("en-gb");
const cors = require("cors");

routes.use(cors());

routes.get("/test", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const data = await client.query("SELECT * FROM userid");
  await client.end();
  //console.log(data.rows[0]);
  res.send(data.rows[0]);
});

routes.get("/user/lastSync/:userid", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const userid = req.params.userid;
  const query = format("SELECT lastSync FROM userid WHERE userid = %L", userid);
  const data = await client.query(query);
  await client.end();
  res.send(data.rows);
});

routes.get("/user/:userid", async function(req, res) {
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

routes.post("/fitness/queryPage", async function(req, res) { //edit this
  console.log("queryPageTest");
  const client = new pg.Client(conString);
  await client.connect();
  const userId = req.body.user.uid;
  const timePeriodString = req.body.user.timePeriod;
  const startTimeString = req.body.user.startTime;
  const endTimeString = req.body.user.endTime;
  const comparision = req.body.user.comparision;
  const moodComparision = req.body.user.moodComparision + "level";
  //end
  const mood = req.body.user.mood + "level";
  const today = moment();
  let timePeriods = moment();
  let timePeriodComparision = moment();

  switch(startTimeString){
    case "Today":
      break;
    
     case "This Week":
      timePeriods = moment(today).startOf("week").isoWeekday(1);

      break;

    case "Last Week":
      timePeriods = moment().subtract(7, "days");
      break;

  }

  switch (endTimeString) { //edit
    case "Today":
      break;

    case "This Week":
      timePeriodComparision = moment(today).startOf("week").isoWeekday(1);
      break;

    case "Last Week":
      timePeriodComparision = moment().subtract(7, "days");
      break;
  }

  //const values = [mood, timePeriods.toISOString(), timePeriodComparision.toISOString(), userId];

  const query = format(
    "SELECT " +
      mood +
      " FROM userinput WHERE collectiondate BETWEEN %L AND %L AND userid = %L", //edit
    timePeriods.toISOString(),
    timePeriodComparision.toISOString(),
    userId
  );
  const data = await client.query(query);
  console.log(data);
  console.log(query);
  //make call here to function that will anayalse the data returned from the database
  await client.end();
  res.send(true);
});





routes.get("/fitness/querying", async function(req, res) {
  console.log("this thing is working");
  res.send("this thing is working");
});

module.exports = routes;
