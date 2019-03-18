var express  = require("express");
var router   = express.Router();
var firebase = require("firebase");
var admin    = require("firebase-admin");

var serviceAccount = require("../admin-sdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();


router.get("/", function(req, res){
  res.render("home");
});

// AUTH ROUTES
router.get("/register", function(req, res){
  res.render("register");
});
// handle sign up logic
router.post("/register", function(req, res){

  email = req.body.email;
  password = req.body.password;

  firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(){
    firebase.auth().currentUser.sendEmailVerification().then(function(){
      console.log("мейл илгээлээ. Баталгаажуулаарай!");
      // check its admin or client/moderator/
      var data = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        gender: req.body.gender,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        email: req.body.email,
        createdAt: admin.firestore.Timestamp.now().toDate()
        // timestamp: admin.firestore.Timestamp.now()
      };
      var result = addToDB(data);
      if(result != null){
        console.log("Амжилттай бүртгүүллээ.");
        res.redirect("/secret");
      } else {
        res.render("/register");
      }
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
});

router.get("/login", function(req, res){
  res.render("login");
});

router.post("/login", function(req, res){
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(user){
    console.log("Амжиллттай нэвтэрлээ.");
    // super_admin, moderator, client {shelfOwner, Lender}, shipper
    res.redirect("/secret");
  }).catch(function(err) {
    // Handle Errors here.
    if(err){
      console.log("Нэвтрэх үеийн алдаа гарлаа.");
      console.log(err.code);
      return res.render("login");
    } else {
      console.log("Something weird happens!");
      return res.render("login");
    }
  });
});

// Log out
router.get("/logout", function(req, res){
  firebase.auth().signOut().then(function() {
    console.log("Sign Out is Амжиллттай.");
    res.redirect("/");  // return res.render("login");
  }).catch(function(error) {
    console.log("Алдаа гарлаа.");
  });

});

// Password forget for login sessions

router.get("/forgot", function(req, res){
  res.render("forgot");
});

router.post("/forgot", function(req, res){
  var emailAddress = req.body.email;
  // Check it is current user's mail.
  firebase.auth().sendPasswordResetEmail(emailAddress).then(function(){
    console.log("mail has been sent to " + emailAddress);
    // Route to show the mail has been sent.
  }).catch(function(error) {
    console.log("Something is wrong now.");
  });
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

// Add user data to DB when register sessions
function addToDB(data){
  // add firebase add data function
  var user = firebase.auth().currentUser;
  if(user != null){
    var docRef = db.collection('users').doc(user.uid).set(data);
    return docRef;
  } else {
    return null;
  }
}

module.exports = router;
