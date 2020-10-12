const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");
const faker = require("faker");

let database = null;

const mongo = new MongoMemoryServer();

async function startDatabase() {
  const mongoDBURL = await mongo.getConnectionString();
  const connection = await MongoClient.connect(mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  //Seed Database
  if (!database) {
    let logs = [];

    console.log("Seeding Database");

    for (let i = 0; i < 100; i++) {
      let record = {
        activity: `User ${faker.name.findName()} performed activity ${faker.random.number()}`,
        date: faker.date.past()
      };
      logs.push(record);
    }

    database = connection.db();
    await database.collection("logs").insertMany(logs);

    console.log("Seeding Complete");
  }

  return database;
}

async function stopDatabase() {
  await mongo.stop();
}

module.exports = {
  startDatabase,
  stopDatabase
};
