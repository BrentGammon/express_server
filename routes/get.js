const routes = require("express").Router();
const pg = require("pg");
const conString = "postgres://postgres:password@localhost:5432/fitnessInfo";
const format = require("pg-format");
const moment = require("moment");
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

module.exports = routes;
