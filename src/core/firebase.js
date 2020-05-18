const Firebase = require("firebase-admin");

Firebase.initializeApp({
  credential: Firebase.credential.applicationDefault(),
  databaseURL: "https://draycer-a84cb.firebaseio.com"
});

module.exports = Firebase;
