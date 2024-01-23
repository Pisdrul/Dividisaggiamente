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

app.use(session({ //token sessione
    secret: 'segreto123',
    resave: false
}));


function autenticazione(req, res, next){ //rimanda errore se l'utente non è autenticato e cerca di accedere a una risorsa restricted
    if(req.session.user){
        next();
    } else {
        res.status(403).send("Non Autenticato");
    }
}
app.get("/api/userlist", autenticazione, async (req,res) =>{ //ritorna lista degli user iscritti al server, serve per select di nuova spesa
    const users = await connectToDB();
    const accountsList = await users.collection("users").find().toArray();
    res.json(getUsernames(accountsList));
})

app.get("/api/username", autenticazione, async (req,res) =>{ //ritorna username dell'user della sessione
    res.json(req.session.user.username);
})

app.post("/api/auth/signup", async (req,res) => { //iscrizione al sito
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
app.get("/api/auth/logout", autenticazione, async (req,res) =>{ //fa logout disturggendo la sessione
    req.session.destroy();
    res.json("Logout");
})

app.get("/api/budget", autenticazione, async (req,res) =>{ //trova le spese dell'utente cercando quali spese hanno l'utente come partecipante
    const userId = req.session.user.username;
    const query = new RegExp(userId);
    const db = await connectToDB();
    const querySpese = await db.collection("spese").find({"Partecipanti+Quote":{$regex: query}}).toArray();
    res.json(querySpese);

})


app.get("/api/budget/:year/:month", autenticazione, async (req,res) =>{
    const db = await connectToDB();
    const userId = req.session.user.username+":";
    const query = new RegExp(userId);
    const dataquery = new RegExp(req.params.year+"-"+ req.params.month);
    const trovato = await db.collection("spese").find({'Data':{$regex: dataquery}, 'Partecipanti+Quote':{$regex: query}}).toArray();
    res.json(trovato);
})

app.get("/api/budget/:year/:month/:id", autenticazione, async (req,res) =>{
    const id = parseInt(req.params.id);
    const db = await connectToDB();
    const spesa = await db.collection("spese").findOne({'id' : id});
    console.log(spesa);
    res.json(spesa);
})

app.post("/api/budget/:year/:month", autenticazione, async (req,res) =>{
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

app.put("/api/budget/:year/:month/:id", autenticazione, async(req,res)=>{
    const id = parseInt(req.params.id);
    const db = await connectToDB();
    var quoteArray = [];
    for(partecipante in req.body.partecipanti){
        quoteArray.push(req.body.partecipanti[partecipante] + ":" + req.body.quote[partecipante]);
    }
    const spesamodificata = {'id': id, 'Categoria': req.body.categoria, 'Descrizione': req.body.descrizione, 'Data': req.body.data, 'Partecipanti+Quote': quoteArray};
    await db.collection("spese").findOneAndReplace({'id':id}, spesamodificata);
    res.json("ok");
})

app.delete("/api/budget/:year/:month/:id", autenticazione, async(req,res)=>{
    const id = parseInt(req.params.id);
    const db = await connectToDB();
    await db.collection("spese").findOneAndDelete({'id':id});
    res.json("fatto");
})

app.get("/api/balance", autenticazione, async (req,res) =>{ //rimanda il bilancio
    var bilancio =0
    const userId = req.session.user.username + ":";
    const query = new RegExp(userId);
    const db = await connectToDB();
    const result = await db.collection("spese").find({"Partecipanti+Quote":{$regex: query}}).toArray();
    var filterValue = req.session.user.username+":";
    result.forEach(entry => {
        const valori = entry['Partecipanti+Quote']   ;
        const statement = valori.filter(option => option.startsWith(filterValue));
        const quota = statement[0].split(':');
        const valquota = parseFloat(quota[1]);
        bilancio -=valquota;
    });
    res.json(bilancio);

})

app.get("/api/balance/:id", autenticazione, async (req,res) =>{ //prende l'user della sessione e ritorna tutte le spese con nome utente = id
    const user = "^"+ req.session.user.username+":";
    const userRegex = new RegExp(user);
    const userId = "^" + req.params.id + ":";
    const userIdRegex = new RegExp(userId);
    const db = await connectToDB();
    const query = await db.collection("spese").find({$and: [{'Partecipanti+Quote':{$regex: userRegex}}, {'Partecipanti+Quote':{$regex: userIdRegex}}]}).toArray();
    res.send(query);
})

app.get("/api/budget/search", autenticazione, async (req,res) =>{ //cerca spese in base a categoria e descrizione
    const userId = req.session.user.username +":";
    const userIdRegex = new RegExp(userId);
    const catRe = "^" + req.query.Categoria;
    const catRegex = new RegExp(catRe);
    const descrRe  = "^" + req.query.Descrizione;
    const descrRegex = new RegExp(descrRe);
    const db = await connectToDB();
    const spese = await db.collection("spese").find({'Categoria':{$regex: catRegex},'Descrizione':{$regex: descrRegex},'Partecipanti+Quote':{$regex: userIdRegex}}).toArray();
    res.json(spese);
})
app.get("/api/budget/:year", autenticazione, async (req,res) =>{
    const db = await connectToDB();
    const userId = req.session.user.username+":";
    const query = new RegExp(userId);
    const dataquery = new RegExp(req.params.year);
    const trovato = await db.collection("spese").find({'Data':{$regex: dataquery}, 'Partecipanti+Quote':{$regex: query}}).toArray();
    res.json(trovato);
}) 
app.get("/api/budget/whoami", autenticazione, async (req,res) =>{
    res.json(req.session.user); //ritorna username e pw della sessione
})

app.get("/api/users/search", autenticazione, async (req,res) =>{ //cerca tra categoria e descrizione
    const queryRegex = "^" + req.query.q;
    console.log(req.query.d);
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

async function connectToDB(){ //connette al database
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

app.get("/firsttime", async (req,res) =>{ //Inserire dati nel database vuoto, attenzione a farlo più di una volta che genera doppioni
    const db = await connectToDB();
    await db.collection("users").insertMany([
        {
        username: "francesco",
        password: "password"
    },
    {
        username: 'valeria',
        password: 'password'
    },
    {
        username: "utente",
        password: "password"
    },
    {
        username: "antonio",
        password: "password"
    },
    {
        username: "claudio",
        password: "password"
    }
    ]);
    await db.collection("spese").insertMany(
        [
            {"id" : 1, "Categoria" : "Cena", "Descrizione" : "Cena fuori amici calcetto", "Data" : "2023-02-26", "Partecipanti+Quote" : [ "valeria:25", "francesco:25","claudio:25","antonio:25","utente:25" ] },
            {"id" : 2, "Categoria" : "Pranzo", "Descrizione" : "Pranzo fuori con claudio", "Data" : "2021-04-11", "Partecipanti+Quote" : [  "antonio:25","claudio:25"] },
            {"id" : 3, "Categoria" : "Paga", "Descrizione" : "Arrivata 13esima", "Data" : "2022-12-28", "Partecipanti+Quote" : ["utente:-1300"] },
            {"id" : 4, "Categoria" : "Aperitivo", "Descrizione" : "Spritz con francesco e claudio", "Data" : "2024-01-10", "Partecipanti+Quote" : [ "valeria:10", "francesco:10","claudio:5",] },
            {"id" : 5, "Categoria" : "Mutuo", "Descrizione" : "Pagamento rata dicembre", "Data" : "2023-12-10", "Partecipanti+Quote" : [ "valeria:200",] },
            {"id" : 6, "Categoria" : "Cena", "Descrizione" : "Cena con tutti", "Data" : "2024-01-10", "Partecipanti+Quote" : [ "valeria:25", "francesco:25","claudio:25","utente:25","antonio:25"] },
            {"id" : 7, "Categoria" : "Pagamento", "Descrizione" : "Pagato valeria", "Data" : "2024-01-10", "Partecipanti+Quote" : [ "francesco:50", "valeria:-50"] },
            {"id" : 8, "Categoria" : "Paga", "Descrizione" : "Paga arrivata", "Data" : "2024-01-25", "Partecipanti+Quote" : [ "utente:-500"] },
            {"id" : 9, "Categoria" : "Vacanza", "Descrizione" : "Pagato biglietti vacanza", "Data" : "2022-05-16", "Partecipanti+Quote" : [ "valeria:100", "francesco:100" ] },
            {"id" : 10, "Categoria" : "Calcetto", "Descrizione" : "Comprato palloni", "Data" : "2023-02-11", "Partecipanti+Quote" : [ "valeria:25" ] },
            {"id" : 11, "Categoria" : "Paga", "Descrizione" : "Paga Gennaio", "Data" : "2024-01-25", "Partecipanti+Quote" : [ "francesco:-100" ] },
            {"id" : 12, "Categoria" : "Paga", "Descrizione" : "Arrivata Paga Gennaio", "Data" : "2024-01-16", "Partecipanti+Quote" : [ "valeria:-100" ] },
            {"id" : 13, "Categoria" : "Spesa", "Descrizione" : "Spesa assieme a pis", "Data" : "2024-01-23", "Partecipanti+Quote" : [ "francesco:75", "valeria:25" ] },
            {"id" : 14, "Categoria" : "Cena", "Descrizione" : "Cena fuori", "Data" : "2024-01-23", "Partecipanti+Quote" : [ "utente:25", "claudio:25" ] },
            {"id" : 15, "Categoria" : "Spesa", "Descrizione" : "Spesa assieme a valeria", "Data" : "2023-11-23", "Partecipanti+Quote" : [ "francesco:45", "valeria:20" ] } 
    ]);
    res.json("Success");
})