import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS-E-W1L3XK7stlVsS1c02FRzCBSA1zsE",
  authDomain: "pfep-9ded1.firebaseapp.com",
  projectId: "pfep-9ded1",
  storageBucket: "pfep-9ded1.appspot.com",
  messagingSenderId: "333176142301",
  appId: "1:333176142301:web:afced671374fc979e35e34"
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
console.log("Firebase initialized");

// Function to reset form inputs
function resetFormInputs() {
  console.log("Resetting form inputs");
  document.getElementById('routingNumber').value = '';
  document.getElementById('accountNumber').value = '';
  document.getElementById('bankNameSelect').selectedIndex = 0;
}

// Event listener to reset form inputs on page load
window.addEventListener('load', function() {
  console.log("Page loaded, resetting form inputs");
  resetFormInputs();
});

// Function to determine bank name based on routing number (if possible)
function determineBankName(routingNumber) {
  const bankNames = {
    "111000025": "Bank of America",
    "121000358": "Wells Fargo",
    "021000021": "JPMorgan Chase",
    // Add more routing number to bank name mappings here
  };
  return bankNames[routingNumber] || null;
}

// Function to check if bank account already exists
async function bankAccountExists(user, routingNumber, accountNumber) {
  const accountQuery = query(collection(db, 'users', user.uid, 'bankAccounts'), where('routingNumber', '==', routingNumber), where('accountNumber', '==', accountNumber));
  const accountSnapshot = await getDocs(accountQuery);
  return !accountSnapshot.empty;
}

// Event listener to update bank name select input based on routing number
document.getElementById('routingNumber').addEventListener('input', function() {
  const routingNumber = document.getElementById('routingNumber').value.trim();
  const bankName = determineBankName(routingNumber);
  const bankNameSelect = document.getElementById('bankNameSelect');

  if (bankName) {
    bankNameSelect.value = bankName;
  } else {
    bankNameSelect.selectedIndex = 0; // Reset to default if bank name is unknown
  }
});

// Event listener for "Add Bank Account" button click
document.getElementById('addBankAccountButton').addEventListener('click', async function(e) {
  e.preventDefault();
  console.log("Add Bank Account button clicked");

  const routingNumber = document.getElementById('routingNumber').value.trim();
  const accountNumber = document.getElementById('accountNumber').value.trim();
  const bankName = document.getElementById('bankNameSelect').value.trim();

  console.log("Routing Number:", routingNumber);
  console.log("Account Number:", accountNumber);
  console.log("Bank Name:", bankName);

  if (!routingNumber || !accountNumber || !bankName) {
    console.log("Validation failed, missing fields");
    alert('Please fill out all fields correctly.');
    return;
  }

  // Get the current user
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User is authenticated:", user.uid);

      // Check if bank account already exists
      if (await bankAccountExists(user, routingNumber, accountNumber)) {
        console.log("Bank account already exists");
        alert('This bank account is already linked to your account.');
        return;
      }

      try {
        // Add bank account to Firestore subcollection
        console.log("Adding bank account to Firestore subcollection for user:", user.uid);
        await addDoc(collection(db, 'users', user.uid, 'bankAccounts'), {
          routingNumber: routingNumber,
          accountNumber: accountNumber,
          bankName: bankName
        });
        console.log("Bank account linked successfully");
        alert('Bank account linked successfully!');
        window.location.href = "Account.html";
        // Optionally, reset the form inputs
        resetFormInputs();
      } catch (error) {
        console.error('Error adding bank account:', error);
        alert('Error linking bank account. Please try again.');
      }
    } else {
      console.log("User is not authenticated");
      alert('You need to be signed in to link a bank account.');
    }
  });
});
