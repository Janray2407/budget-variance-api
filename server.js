const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://budgetUser:<db_password>@cluster0.f7thx.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);

async function connectDB() {
await client.connect();
}

connectDB();

const db = client.db("budget_monitoring");

app.post("/uploadBudget", async (req,res)=>{

const data = req.body;

await db.collection("budget_data").insertMany(data);

res.send("Budget Uploaded");

});

app.post("/uploadActual", async (req,res)=>{

const data = req.body;

await db.collection("actual_data").insertMany(data);

res.send("Actual Uploaded");

});

app.get("/calculateVariance", async (req,res)=>{

const actual = await db.collection("actual_data").find().toArray();
const budget = await db.collection("budget_data").find().toArray();

let result = [];

actual.forEach(a=>{

const b = budget.find(x=>x.account === a.account);

if(b){

const variance = a.net - b.budget;

result.push({
account:a.account,
actual:a.net,
budget:b.budget,
variance:variance
});

}

});

await db.collection("variance_result").insertMany(result);

res.json(result);

});

app.get("/dashboard", async(req,res)=>{

const data = await db.collection("variance_result").find().toArray();

res.json(data);

});

app.listen(3000,()=>{
console.log("Server running");
});
