//jshint esversion:8
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// this is for new database. since our db already has entries, doing it the uncommented way
// where one string is used instead of 2 keys
// const encKey = process.env.SOME_32BYTE_BASE64_STRING;
// const sigKey = process.env.SOME_64BYTE_BASE64_STRING;
//
// userSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey });

// getting value from environment variables (dotenv package)
const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const email = req.body.username;
    const password = req.body.password;

    User.findOne({email: email}, function(err, foundUser){
        if(err) {
            console.log(err);
        } else {
            if(foundUser) {
                if(foundUser.password === password) {
                    res.render("secrets");
                } else {
                    console.log("No such user");
                }
            }
        }
    });
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const email = req.body.username;
    const password = req.body.password;

    const newUser = new User({
        email: email,
        password: password
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.listen(3000, function(){
    console.log("Started server on port 3000");
});
