const express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs/promises');
const uri = "mongodb://mongohost";
const app = express();

app.use(express.urlencoded());
const client = new MongoClient(uri);
let db = null;
app.use(express.static(`${__dirname}/public`));
app.use(express.json());


app.post("/api/auth/signup", async (req,res) => {
    res.json({msg: "sign up"});
})

app.post("/api/auth/signin", async (req,res) =>{
    res.json({msg: "sign in"});
})