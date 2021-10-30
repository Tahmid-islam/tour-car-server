const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
var cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsljh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("tourCar");
    const servicesCollection = database.collection("cars");
    const bookingCollection = database.collection("bookings");

    //Get API
    app.get("/cars", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    //Get single service
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    //Post API
    app.post("/cars", async (req, res) => {
      const services = req.body;
      const result = await servicesCollection.insertOne(services);
      res.json(result);
    });

    // Add bookings API
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.json(result);
    });

    //Get API
    app.get("/bookings", async (req, res) => {
      const cursor = bookingCollection.find({});
      const booking = await cursor.toArray();
      res.send(booking);
    });

    //Get Specific User Booking API
    app.get("/myBookings/:email", async (req, res) => {
      const result = await bookingCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(result);
    });

    // Update API
    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //Delete API
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Tour Car Server");
});

app.listen(port, () => {
  console.log(`Running Tour Car Server on port`, port);
});
