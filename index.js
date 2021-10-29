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
      res.send(singleBook);
    });
    app.post("/savebooking", async (req, res) => {
      const newBook = req.body;
      const result = await bookingCollection.insertOne(newBook);
      res.send(result);
    });
    app.get("/carts/:email", async (req, res) => {
      const email = req.params.email;
      const findCarts = bookingCollection.find({ Email: email });
      if ((await findCarts.count()) > 0) {
        res.send(await findCarts.toArray());
      } else {
        res.send([]);
      }
    });
    app.delete("/cartDelete/:id", async (req, res) => {
      const id = ObjectId(req.params.id);
      const deleteResult = await bookingCollection.deleteOne({ _id: id });
      res.send(deleteResult);
    });
    app.get("/allOrders", async (req, res) => {
      const ordersResult = bookingCollection.find({});
      if ((await ordersResult.count()) > 0) {
        res.send(await ordersResult.toArray());
      } else {
        res.send([]);
      }
    });
    app.put("/update-status/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const updateStatus = req.body.status;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateStatus,
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
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
