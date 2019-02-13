var express    = require("express");
var app        = express();
var bodyParser = require("body-parser");
var firebase   = require("firebase");


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

var config = {
  apiKey: "AIzaSyABzu0Km2hwvFdqC5hd81WmMnJEAbS31Jg",
  authDomain: "authdemo-f7863.firebaseapp.com",
  databaseURL: "https://authdemo-f7863.firebaseio.com",
  projectId: "authdemo-f7863",
  storageBucket: "authdemo-f7863.appspot.com",
  messagingSenderId: "456740131609"
};
firebase.initializeApp(config);


app.get("/", function(req, res){
  // var user = firebase.auth().currentUser;
  // var emailVerified = user.emailVerified;
  // res.render("home", {mailStatus: emailVerified});
  res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
  var user = firebase.auth().currentUser;
  var emailVerified = user.emailVerified;
  res.render("secret", {mailStatus: emailVerified});
});

app.get("/register", function(req, res){
  res.render("register");
});
// handle sign up logic
app.post("/register", function(req, res){
  // var newUser = new User({username: req.body.username});
  // User.register(newUser, req.body.password, function(err, user){
  email = req.body.email;
  password = req.body.password;

  if(email.length < 4) {
    console.log("Мейл хаягаа бүрэн оруулна уу!");
    return res.render("register");
  }
  if(password.length < 4) {
    console.log("Нууц үг хангалтгүй!");
    return res.render("register");
  }

  firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(){
    firebase.auth().currentUser.sendEmailVerification().then(function(){
      console.log("мейл илгээлээ. Баталгаажуулаарай!");
    });
    console.log("Амжилттай бүртгүүллээ.");
    res.redirect("/secret");
  }).catch(function(err) {
    // Handle Errors here.
    var errorCode = err.code;
    var errorMessage = err.message;
    if (errorCode === "auth/weak-password") {
      console.log("Нууц үг сул байна!");
      res.redirect("/register");
    } else {
      console.log(errorMessage);
      res.redirect("/register");
      //send flash message
    }
  });
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res){
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(user){
    console.log("Амжиллттай нэвтэрлээ.");
    res.redirect("/secret");
  }).catch(function(err) {
    // Handle Errors here.
    if(err){
      console.log("Нэвтрэх үеийн алдаа гарлаа.");
      return res.render("login");
    } else {
      console.log("Something weird happens!");
      return res.render("login");
    }
  });
});

// Log out
app.get("/logout", function(req, res){
  firebase.auth().signOut().then(function() {
    console.log("Sign Out is Амжиллттай.");
    res.redirect("/");  // return res.render("login");
  }).catch(function(error) {
    console.log("Алдаа гарлаа.");
  });

});

app.get("/reset", isLoggedIn, function(req, res){
  res.render("reset");
});

app.post("/reset", function(req, res){

  var oldPassword = req.body.oldPassword;
  var newPassword1 = req.body.newPassword1;
  var newPassword2 = req.body.newPassword2;

  var user = firebase.auth().currentUser;
  var email = user.email;
  var credential = firebase.auth.EmailAuthProvider.credential(
      email,
      oldPassword
  );

  if(newPassword1 === newPassword2){
    console.log("password is match!");
    var newPassword = newPassword1;
    if(newPassword.length < 4) {
      console.log("Нууц үг хангалтгүй!");
      return res.render("reset");
    }
  } else {
    console.log("Wrong!");
    return res.render("reset");
  }


  user.reauthenticateAndRetrieveDataWithCredential(credential).then(function(){
    console.log("new pass:" + newPassword);
    console.log("User re-authenticated Zee!");
    user.updatePassword(newPassword).then(function() {
      console.log("Success");
      res.redirect("/secret");
      // Send email to user to notify the password is changed.
    }).catch(function(error){
      console.log(error.message);
    })
  }).catch(function(error){
    console.log(error.message);
  })




});

//Middleware
function isLoggedIn(req, res, next) {
  var user = firebase.auth().currentUser;
  if(user != null) {
    var emailVerified = user.emailVerified; // BUG has to rebuild
    console.log("Verification Status: " + emailVerified);
    return next();
  } else {
    console.log("Hello from unauthenticated users.");
    res.redirect("/login");
  }
}

app.listen(3000, function(req, res){
  console.log("Auth server started!");
});
