// Your Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyBS-E-W1L3XK7stlVsS1c02FRzCBSA1zsE",
  authDomain: "pfep-9ded1.firebaseapp.com",
  projectId: "pfep-9ded1",
  storageBucket: "pfep-9ded1.appspot.com",
  messagingSenderId: "333176142301",
  appId: "1:333176142301:web:afced671374fc979e35e34"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Sign-up with email and password
document.getElementById('sign-up-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('passwordInput').value;
  const name = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const phoneNumber = document.getElementById('phone-number').value;
  const countryCode = document.getElementById('country-code').value;
  const countrySelect = document.getElementById('countrySelect').value;
  const currency = document.getElementById('currencySelect').value;
  const username = document.getElementById('username').value;


  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      var user = userCredential.user;
      console.log('User signed up:', user);

      return db.collection("users").doc(user.uid).set({
        name: name,
        lastName: lastName,
        user : username,
        email : email,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        currency: currency,
        countrySelect: countrySelect,
        balance: 0,
        profilePictureUrl: 'public/blankprofilepicture973460-1280-cropped-1@2x.png'
      });
    })
    .then(() => {
      console.log("User details saved successfully!");
      window.location.href = "Account.html";
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error('Error signing up:', errorCode, errorMessage);
    });
});

// Sign-up with Google
document.getElementById('google').addEventListener('click', (event) => {
  event.preventDefault();

  var provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      var user = result.user;
      console.log('User signed in with Google:', user);

      // Extract user data from the Google account
      const name = user.displayName.split(' ')[0];
      const lastName = user.displayName.split(' ')[1];
      const email = user.email;
      const profilePictureUrl = user.photoURL;

      // Add a new document in collection "users"
      return db.collection("users").doc(user.uid).set({
        name: name,
        lastName: lastName,
        phoneNumber: '',  // No phone number from Google sign-in
        countryCode: '',  // No country code from Google sign-in
        currency: '',  // No currency from Google sign-in
        countrySelect: '',  // No country select from Google sign-in
        balance: 0,
        profilePictureUrl: profilePictureUrl || 'public/blankprofilepicture973460-1280-cropped-1@2x.png'
      });
    })
    .then(() => {
      console.log("User details saved successfully!");
      window.location.href = "Account.html";
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error('Error signing in with Google:', errorCode, errorMessage);
    });
});
