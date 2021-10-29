const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb Config
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdjvz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travelData");
    const destinationCollection = database.collection("destinations");
    const bookingCollection = database.collection("booking");
    app.post("/get-destination", async (req, res) => {
      console.log(req.body);
      let newDestinaiton = req.body;
      const addedResult = await destinationCollection.insertOne(newDestinaiton);
      res.send(addedResult);
    });
    app.get("/get-tours", async (req, res) => {
      const cursor = destinationCollection.find({});
      if ((await cursor.count()) > 0) {
        const alltours = await cursor.toArray();
        res.send(alltours);
      } else {
        res.send(404);
      }
    });
    app.get("/booking/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const singleBook = await destinationCollection.findOne({ _id: id });
      console.log(singleBook);
      res.send(singleBook);
    });
    app.post("/savebooking", async (req, res) => {
      const newBook = req.body;
      const result = await bookingCollection.insertOne(newBook);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.error());
app.get("/", (req, res) => {
  res.send("Server Running Successfully");
});

app.listen(port, () => {
  console.log("server Running On", port);
});
