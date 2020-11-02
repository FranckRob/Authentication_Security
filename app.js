//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Level 4 : Salting
const saltRounds = 10; // Level 4 : Nb of rounds
//const md5 = require("md5");  // Level 3 : Hashing
//const encrypt =require("mongoose-encryption"); //Level 1 : Database content encryption

app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({entended: true},{ useUnifiedTopology: true }));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email : String,
  password : String
});

//userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ["password"]}); //Level 1 : Database content encryption

const User = new mongoose.model("User", userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){

  bcrypt.hash(req.body.password, saltRounds, function(err,hash){ // Level 4 : Salting
    const newUser = new User({
      email : req.body.username,
      //password : md5(req.body.password) // Level 3 : md5() ---- Hashing the password entered for registration
      password : hash
    });
    newUser.save(function(err){
      if(!err){
        res.render("secrets");
      }else {
        console.log(err);
      }
    });
  });
});

app.post("/login",function(req,res){
  const username = req.body.username;
  //const password = md5(req.body.password); // Level 3 :  md5() ---- Hashing the password entered for login
  const password = req.body.password;

  User.findOne({email: username},function(err,foundUser){
    if(err){
      console.log(err);
    }else {
      if(foundUser){
        //if(foundUser.password===password){ // Replace this line for bcrypt.compare license
        bcrypt.compare(password, foundUser.password, function(err,result){
          if(result===true) {
            res.render("secrets");
          }
        });
        }
      }
  });
});

app.listen(3000,function(){
  console.log("Server started on port 3000.");
});
