const routes = require("express").Router();
const pg = require("pg");
const conString = "postgres://postgres:password@localhost:5432/fitnessInfo";
const format = require("pg-format");
const moment = require("moment");
moment.locale("en-gb");
const cors = require("cors");
const stats = require("../statistical/statistical");

routes.use(cors());

routes.get("/test", async function(req, res) {
  const client = new pg.Client(conString);
  await client.connect();
  const data = await client.query("SELECT * FROM userid");
  await client.end();
  //console.log(data.rows[0]);
  res.send(data.rows[0]);
});

//end point
// routes.get("", async function(req, res) {
//   await client.connect();
//   const data = await client.query("SELECT * FROM userid");
//   await client.end();
// });

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

routes.get("/fitness/querying/correlation", async function(req, res) {
  //console.log(req.query);
  let data1 = req.query.data1.map(item => {
    return parseInt(item);
  });
  let data2 = req.query.data2.map(item => {
    return parseInt(item);
  });
  let result = stats.correlation(data1, data2);
  console.log(result);
  res.send(result);
});

module.exports = routes;
