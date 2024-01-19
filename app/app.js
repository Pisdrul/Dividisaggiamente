const express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs/promises');
const session = require('express-session');
const { verify } = require('crypto');
const uri = "mongodb://mongohost";
const app = express();
console.log("attivato");
app.use(express.static(`${__dirname}/public`));

app.use(express.urlencoded());
const client = new MongoClient(uri);
let db = null;

app.use(express.json());
app.use(session({
    secret: 'segreto123',
    resave: false
}));
function autenticazione(req, res, next){
    if(req.session.user){
        next();
    } else {
        res.redirect("/index.html");
    }
}
app.post("/api/auth/signup", async (req,res) => {
    const new_username = req.body.username;
    const new_password = req.body.password;
    const credentials = {username: new_username, password: new_password};
    await client.connect();
    const users = client.db("DividiSaggiamente");
    const user_found = await users.collection("users").findOne({"username" : new_username});
    if (user_found == null){
        await users.collection("users").insertOne(credentials);
    }
    res.json(user_found);
})

app.post("/api/auth/signin", async (req,res) =>{
    console.log(req.session.user);
    if(req.session.user != null){
        res.json("autenticato");
        return null;
    }
    await client.connect();
    const users = client.db("DividiSaggiamente");
    const db_user = await users.collection("users").findOne({username: req.body.username});
    if(db_user === null){
        res.json("Non esistente");
    }
    else if(db_user.password === req.body.password){
        req.session.user = db_user;
        res.json("si");
    } else {
        res.json(null);
    }
})
app.get("/api/auth/logout", autenticazione, async (req,res) =>{
    req.session.destroy();
    res.json("Sto blablaba");
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
