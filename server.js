const express = require("express");
let bodyParser = require("body-parser");
const { startDatabase } = require("./database");
let cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());

const dbSetup = async (req, res, next) => {
  if (!req.db) {
    const db = await startDatabase();
    req.db = db;
  }

  next();
};

app.use(dbSetup);

app.get("/", (req, res) => {
  res.send("Welcome to the Awesome Users API!");
});

app.get("/logs/fetch/:total", async (req, res) => {
  console.log(req.params.total);
  const logsLimit = Number(req.params.total) || 100;
  const users = await req.db
    .collection("logs")
    .find()
    .limit(logsLimit)
    .toArray();

  res.status(200).send(users);
});

app.get("/logs/clean", async (req, res) => {
  try {
    let d = new Date();
    let currentYear = d.getFullYear();
    let today = new Date(`${currentYear}-01-01`);

    let total_records_to_delete = await req.db
      .collection("logs")
      .find({
        date: {
          $lt: today
        }
      })
      .count();

    const removedResult = await req.db.collection("logs").deleteMany({
      date: { $lt: new Date(today) }
    });

    res.status(200).send({
      message: `There are ${total_records_to_delete} to delete`,
      result: removedResult
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
