var express    = require("express");
var app        = express();
var bodyParser = require("body-parser");
var firebase   = require("firebase");

var indexRoutes = require("./routes/index");
var userRoutes  = require("./routes/users");
var middleware  = require("./middleware"); // it requires index.js as default

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.set("view engine", "ejs");

// read express sessions...
var config = {
  apiKey: "AIzaSyABzu0Km2hwvFdqC5hd81WmMnJEAbS31Jg",
  authDomain: "authdemo-f7863.firebaseapp.com",
  databaseURL: "https://authdemo-f7863.firebaseio.com",
  projectId: "authdemo-f7863",
  storageBucket: "authdemo-f7863.appspot.com",
  messagingSenderId: "456740131609"
};
firebase.initializeApp(config);
// Declaring this app will use index.js as module
app.use(indexRoutes);
app.use("/users", userRoutes);


app.get("/secret", middleware.isLoggedIn, function(req, res){
  var user = firebase.auth().currentUser;
  var emailVerified = user.emailVerified;

  res.render("secret", {mailStatus: emailVerified});
});

app.listen(3000, function(req, res){
  console.log("Auth server started!");
});
