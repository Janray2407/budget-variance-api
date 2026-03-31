const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

const uri = "YOUR_MONGODB_CONNECTION";
const client = new MongoClient(uri);

async function uploadCSV(path, collectionName){

await client.connect();

const db = client.db("budget_system");
const collection = db.collection(collectionName);

const results = [];

fs.createReadStream(path)
.pipe(csv())
.on("data",(data)=> results.push(data))
.on("end", async ()=>{

await collection.insertMany(results);

console.log("Upload Done");

});

}

app.post("/upload-budget", upload.single("file"), async (req,res)=>{

await uploadCSV(req.file.path,"budget");

res.send("Budget Uploaded");

});

app.post("/upload-actual", upload.single("file"), async (req,res)=>{

await uploadCSV(req.file.path,"actual");

res.send("Actual Uploaded");

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
console.log("Server Running");
});