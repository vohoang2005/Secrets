//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-Parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//Level 2 encryption
//Level 3 Hash 
//const md5 = require("md5");
//Level 4 Hash using Bcrypt w/ salt
//const bcrypt = require("bcrypt");
//const saltRounds = 10;

const res = require("express/lib/response");
const { Passport } = require('passport/lib');
const req = require('express/lib/request');

// Mongoose Encrytpion
// const encrypt = require("mongoose-encryption");
const SECRET = process.env.SECRET

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));


app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
//const secret = "Thisisourlittlesecret."
//Mongoose Encryption
//userSchema.plugin(encrypt, {secret: SECRET, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/secrets", function(req, res) {
    User.find({"secret": {$ne: null}}, function(err, foundUser) {
        if(err){
            console.log(err);
        }else{
            if(foundUser) {
                res.render("secrets", {usersWithSecrets: foundUser})
            }
        }
    });
    
});

app.get("/submit", function(req, res) {
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
})

app.post("/submit", function(req, res) {
    const submittedSecret = req.body.secret;

    console.log(req.user)  
    User.findById(req.user.id, function(err, foundUser) {
        if(err) {
            console.log(err);
        }else{
            if(foundUser) {
                foundUser.secret = submittedSecret;
                foundUser.save(function() {
                    res.redirect("/secrets");
                });
            }
        }
    });  
});

app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }else{
            res.redirect("/");
        }
    });
    
});

app.post("/register", function(req, res) {

// bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    
//     const newUser = new User({
//     email: req.body.username,
//     password: hash


// newUser.save(function(err) {
//     if(err) {
//         console.log(err);
//     }else{
//         res.render("secrets");
//     }
//     });
// });
// });

    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })
});
app.post("/login", function(req, res) {
//     const username = req.body.username;
//     const password = req.body.password;

//     User.findOne({email: username}, function(err, foundUser) {
//         if(err) {
//             console.log(err);
//         }else{
//             if(foundUser) {
//                 if(foundUser.password === password) {
//                     res.render("secrets");
//                 }
//             }
//         }
//     })

const user = new User({
    username: req.body.username,
    password: req.body.password
});
    req.login(user, function(err) {
        if(err) {
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })
});




app.listen(3000, function() {
    console.log("Server started on port 3000");
});