// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyBS-E-W1L3XK7stlVsS1c02FRzCBSA1zsE",
  authDomain: "pfep-9ded1.firebaseapp.com",
  projectId: "pfep-9ded1",
  storageBucket: "pfep-9ded1.appspot.com",
  messagingSenderId: "333176142301",
  appId: "1:333176142301:web:afced671374fc979e35e34"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('Signupb').style.display = 'none';
    document.getElementById('loginb').style.display = 'none';
    document.getElementById('container').style.display = 'flex';
  } else {
    document.getElementById('Signupb').style.display = 'block';
    document.getElementById('loginb').style.display = 'block';
    document.getElementById('container').style.display = 'none';
  }
});


// Add click event listener to profileImage for redirection to account.html
document.getElementById('profileImage').addEventListener('click', () => {
  window.location.href = 'Account.html';
});
