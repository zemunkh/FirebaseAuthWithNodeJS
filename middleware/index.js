var firebase = require("firebase");


var middlewareObj = {};

//Middleware
middlewareObj.isLoggedIn = function(req, res, next) {
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

// #2 is user verified its mail or phone phoneNumber
middlewareObj.isVerifiedAuth = function(req, res, next) {
  // #1 Check email Verification:
  var user = firebase.auth().currentUser;
  if(user.emailVerified === false) {
    console.log("First, you should verify your email!");
    // send flash messages !!!!!! re-login after email verification
    res.redirect("/users");
  } else {
    console.log("You are verified user!");
    return next();
  }
}


module.exports = middlewareObj;
