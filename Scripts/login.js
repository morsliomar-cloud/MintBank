// TODO: Replace with your Firebase project's configuration
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
  
  // Redirect to Account.html if user is already logged in
  auth.onAuthStateChanged((user) => {
    if (user) {
      window.location.href = "Account.html";
    }
  });
  
  function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
  
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        alert("Successfully logged in!");
        window.location.href = "Account.html";
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === "auth/internal-error" && errorMessage === "{\"error\":{\"code\":400,\"message\":\"INVALID_LOGIN_CREDENTIALS\",\"errors\":[{\"message\":\"INVALID_LOGIN_CREDENTIALS\",\"domain\":\"global\",\"reason\":\"invalid\"}]}}") {
          alert("Invalid login credentials. Please try again.");
        } else {
          alert("Error: " + errorMessage);
        }
      });
  }
  
  function forgotPassword() {
    var emailAddress = document.getElementById("email").value;
  
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      // Email sent.
      alert("Password reset email sent!");
    }).catch(function(error) {
      // An error happened.
      alert("Error: " + error.message);
    });
  }
  
  // Google login logic
  document.getElementById('google').addEventListener('click', () => {
    var provider = new firebase.auth.GoogleAuthProvider();
  
    auth.signInWithPopup(provider)
      .then((result) => {
        var user = result.user;
        console.log('User signed in with Google:', user);
        window.location.href = "Account.html";
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error('Error signing in with Google:', errorCode, errorMessage);
        alert('Error signing in with Google: ' + errorMessage);
      });
  });
  