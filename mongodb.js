const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;
const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "studentDB";
const COLLECTION_NAME = "students";

const client = new MongoClient(MONGO_URL);
let isMongoConnected = false;

app.use(express.json());

async function getStudentsCollection() {
  if (!isMongoConnected) {
    await client.connect();
    isMongoConnected = true;
    console.log("Connected to MongoDB");
  }

  return client.db(DB_NAME).collection(COLLECTION_NAME);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "mongodb.html"));
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await getStudentsCollection();
    const data = await students.find().sort({ _id: -1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  const { name, age, course } = req.body;

  if (!name || !course || age === undefined) {
    return res.status(400).json({ message: "name, age and course are required" });
  }

  try {
    const students = await getStudentsCollection();
    const result = await students.insertOne({
      name,
      age: Number(age),
      course,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Student added", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Failed to add student", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  if (isMongoConnected) {
    await client.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});