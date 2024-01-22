const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');

const uri = "mongodb://mongohost";
const app = express();

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
        res.status(403).send("Non Autenticato");
    }
}
app.get("/api/userlist", async (req,res) =>{
    const users = await connectToDB();
    const accountsList = await users.collection("users").find().toArray();
    res.json(getUsernames(accountsList));
})

app.get("/api/username", autenticazione, async (req,res) =>{
    res.json(req.session.user.username);
})

app.post("/api/auth/signup", async (req,res) => {
    const new_username = req.body.username;
    const new_password = req.body.password;
    const credentials = {username: new_username, password: new_password};
    const users = await connectToDB();
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
    const users = await connectToDB();
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
    res.json("Logout");
})

app.get("/api/budget", async (req,res) =>{

})

app.get("/api/budget/:year", async (req,res) =>{
    let year = req.params.year;
    res.json(year);
})

app.get("/api/:year/:month/:id", autenticazione, async (req,res) =>{
    res.json(req.params.year + req.params.month + req.params.id);
})

app.post("/api/:year/:month", async (req,res) =>{
    const db = await connectToDB();
    const maxid = await db.collection("spese").find().sort({"id":-1}).limit(1).toArray();
    const id = maxid[0].id + 1
    console.log(id);
    var quoteArray = [];
    for(partecipante in req.body.partecipanti){
        quoteArray.push(req.body.partecipanti[partecipante] + ":" + req.body.quote[partecipante]);
    }
    const spesa = {'id': id, 'Categoria': req.body.categoria, 'Descrizione': req.body.descrizione, 'Data': req.body.data, 'Partecipanti+Quote': quoteArray};
    await db.collection("spese").insertOne(spesa);
    res.json(spesa);
})

app.put("api/:year/:month", autenticazione, async(req,res)=>{
    
})

app.get("/api/balance", async (req,res) =>{
    
})

app.get("/api/balance/:id", async (req,res) =>{
    
})

app.get("/api/budget/search?q=query", async (req,res) =>{
    
})

app.get("/api/budget/whoami", async (req,res) =>{
    
})

app.get("/api/users/search", async (req,res) =>{
    const queryRegex = "^" + req.query.q;
    const regex = new RegExp(queryRegex);
    const db = await connectToDB();
    const result = await db.collection("users").find({username:{ $regex: regex }}).toArray();
    let arrayResult = [];
    if(result.length === 0){
        res.json("Non ho trovato nessun utente, prova di nuovo");
    }else{
        arrayResult = getUsernames(result);
        res.send(arrayResult);
    }
    
})

app.listen(3000, async () => {
});

async function connectToDB(){
    await client.connect();
    const db = client.db("DividiSaggiamente");
    return db;
}
function getUsernames(userArray){
    const arrayResult =[];
    for(user in userArray){
        arrayResult[user] = userArray[user].username;
    }
    return arrayResult;
}
