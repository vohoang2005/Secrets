//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-Parser");
const ejs = require("ejs");
//Level 2 encryption
const mongoose = require("mongoose");
//Level 3 Hash 
//const md5 = require("md5");
//Level 4 Hash using Bcrypt w/ salt
const bcrypt = require("bcrypt");
const saltRounds = 10;

const res = require("express/lib/response");

// Mongoose Encrytpion
// const encrypt = require("mongoose-encryption");
const SECRET = process.env.SECRET

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

const secret = "Thisisourlittlesecret."

//Mongoose Encryption
//userSchema.plugin(encrypt, {secret: SECRET, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema)

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
       
        const newUser = new User({
        email: req.body.username,
        password: hash
    });

newUser.save(function(err) {
    if(err) {
        console.log(err);
    }else{
        res.render("secrets");
    }
    });
});
});
app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser) {
        if(err) {
            console.log(err);
        }else{
            if(foundUser) {
                if(foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    })
})




app.listen(3000, function() {
    console.log("Server started on port 3000");
});