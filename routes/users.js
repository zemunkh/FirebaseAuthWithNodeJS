var express  = require("express");
var router   = express.Router();
var firebase = require("firebase");
var admin    = require("firebase-admin");
var middleware  = require("../middleware"); // it requires index.js as default

var imageUploader = require("../middleware/uploader")


var db = admin.firestore();

// USER PROFILE
router.get("/", middleware.isLoggedIn, function(req, res){
  var user = firebase.auth().currentUser;

  var userRef = db.collection("users").doc(user.uid);
  var getDoc  = userRef.get().then(function(doc){
    if(!doc.exists){
      console.log("No such document");
      return res.redirect("/secret");
    } else {
      console.log("User retrieved data:", doc.data());
      res.render("users/show", {user: doc.data()});
    }
  }).catch(function(err){
    console.log("Error getting documents **", err);
  });
});

// User profile update
router.post("/show", function(req, res){
  var data = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    birthday: req.body.birthday,
    // gender: req.body.gender,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    email: req.body.email,
    createdAt: new Date()
    // timestamp: admin.firestore.Timestamp.now()
  };

  // NEED TO CHECK DATA FIELD IS AVAILABLE

  var user = firebase.auth().currentUser;
  var userRef = db.collection('users').doc(user.uid);
  // update data with transaction process
  var transaction = db.runTransaction(function(t){
    return t.get(userRef).then(function(doc){
      // var newPhoneNumber = doc.data().phoneNumber + 1;
      t.update(userRef, data);
    });
  }).then(function(result){
    console.log("Transaction success! Zee");
    res.redirect("/secret");
  }).catch(function(err){
    console.log("Transaction failure: ", err);
  });

});

// USER PHOTO CHANGE/UPLOAD
router.get("/photo", middleware.isLoggedIn, function(req, res){
  var user = firebase.auth().currentUser;
  // Download and show user's current image from database
  var userRef = db.collection("users").doc(user.uid);
  var getDoc  = userRef.get().then(function(doc){
    if(!doc.exists){
      console.log("No such document");
      return res.redirect("/secret");
    } else {
      var image = doc.data().imageURL;
      console.log("imageURL: ", image);
      res.render("users/photo", {imageURL: image});
    }
  }).catch(function(err){
    console.log("Error getting documents **", err);
  });
});


router.post("/photo", middleware.isLoggedIn, function(req, res){

  // Upload and reload the uploaded image
  // Save it to user's database section

  // Upload to server
  var image = imageUploader.uploadProfileImage(req, res);
  // get link of that uploaded images

  // with user's permission, its url will set to user data.

  // Update imageURL on Cloud Firestore
});

router.post("/upload", middleware.isLoggedIn, function(req, res){
  var user = firebase.auth().currentUser;
  var userRef = db.collection('users').doc(user.uid);

  var imageURL = req.body.email;
  console.log("That URL: ", imageURL);

  if(imageURL != null) {
    userRef.update({
      "imageURL": imageURL
    }).then(function(){
      res.redirect("/secret");
      console.log("imageURL is successfully updated!");
    }).catch(function(err){
      console.log("Error during Update: ", err);
    });
  } else {
    console.log("Error while retrieving imageURL!");
  }

});


// Password reset
router.get("/reset", middleware.isVerifiedAuth, function(req, res){
  res.render("users/reset");
});

router.post("/reset", function(req, res){

  var oldPassword  = req.body.oldPassword;
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
      return res.render("users/reset");
    }
  } else {
    console.log("Wrong!");
    return res.render("users/reset");
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
    });
  }).catch(function(error){
    console.log(error.message);
  });

});

// Delete Account with credential
router.get("/deleteAccount", middleware.isLoggedIn, function(req, res){
  res.render("users/deleteAccount");
});

router.post("/deleteAccount", function(req, res){

  var password = req.body.password;
  var user = firebase.auth().currentUser;
  var email = user.email;
  var credential = firebase.auth.EmailAuthProvider.credential(
      email,
      password
  );

  user.reauthenticateAndRetrieveDataWithCredential(credential).then(function(){
    console.log("User re-authenticated Zee!");
    // Delete account
    user.delete().then(function() {
      console.log("user has been deleted");
      res.redirect("/"); // need some check about the usage of render and redirect
    }).catch(function(error) {
      // An error happened
      console.log("Can not be deleted.");
    });

  }).catch(function(error){
    console.log(error.message);
  });

});

module.exports = router;
