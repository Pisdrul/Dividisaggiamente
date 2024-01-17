const express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs/promises');
const uri = "mongodb://mongohost";
const app = express();
console.log("attivato");
app.use(express.static(`${__dirname}/public`));

app.use(express.urlencoded());
const client = new MongoClient(uri);
let db = null;

app.use(express.json());


app.post("/api/auth/signup", async (req,res) => {
    res.json({msg: "sign up"});
})

app.post("/api/auth/signin", async (req,res) =>{
    await client.connect();
    const users = client.db("users");
    const db_user = await users.collection("users").findOne({username: req.body.username});
    console.log(db_user);
    if(db_user.password === req.body.password){
        res.redirect('/utente.html');
    } else {
        res.status(403).send("Non autenticato!");
    }
})

app.get("/api/budget", async (req,res) =>{

})

app.get("/api/budget/:year", async (req,res) =>{
    let year = req.params.year;
    res.json(year);
})

app.get("/api/:year/:month/:id", async (req,res) =>{
    
})

app.post("/api/:year/:month", async (req,res) =>{
    
})


app.get("/api/balance", async (req,res) =>{
    
})

app.get("/api/balance/:id", async (req,res) =>{
    
})

app.get("/api/budget/search?q=query", async (req,res) =>{
    
})

app.get("/api/budget/whoami", async (req,res) =>{
    
})

app.get("/api/users/search?q=query", async (req,res) =>{
    
})

app.listen(3000, async () => {
});
