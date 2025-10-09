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
  document.getElementById('cardNumber').value = '';
  document.getElementById('expirationDate').value = '';
  document.getElementById('cvv').value = '';
  document.getElementById('cardTypeSelect').selectedIndex = 0;
}

// Event listener to reset card type select input and other inputs on page load
window.addEventListener('load', function() {
  console.log("Page loaded, resetting form inputs");
  resetFormInputs();
});

// Function to determine card type based on card number
function determineCardType(cardNumber) {
  const firstDigit = cardNumber.charAt(0);
  switch (firstDigit) {
    case '3':
      return 'americanexpress'; // American Express
    case '4':
      return 'visa'; // Visa
    case '5':
      return 'mastercard'; // MasterCard
    case '6':
      return 'discover'; // Discover
    default:
      return null; // Unknown card type
  }
}

// Function to check if card already exists
async function cardExists(user, cardNumber) {
  const cardQuery = query(collection(db, 'users', user.uid, 'cards'), where('cardNumber', '==', cardNumber));
  const cardSnapshot = await getDocs(cardQuery);
  return !cardSnapshot.empty;
}

// Event listener to update card type select input based on card number
document.getElementById('cardNumber').addEventListener('input', function() {
  const cardNumber = document.getElementById('cardNumber').value.trim();
  const cardType = determineCardType(cardNumber);
  const cardTypeSelect = document.getElementById('cardTypeSelect');

  switch (cardType) {
    case 'americanexpress':
      cardTypeSelect.value = 'americanexpress';
      break;
    case 'visa':
      cardTypeSelect.value = 'visa';
      break;
    case 'mastercard':
      cardTypeSelect.value = 'mastercard';
      break;
    case 'discover':
      cardTypeSelect.value = 'discover';
      break;
    default:
      cardTypeSelect.selectedIndex = 0; // Reset to default if card type is unknown
      break;
  }
});

// Event listener for "Link Card" button click
document.getElementById('linkCardButton').addEventListener('click', async function(e) {
  e.preventDefault();
  console.log("Link Card button clicked");

  const cardNumber = document.getElementById('cardNumber').value.trim();
  const cardType = determineCardType(cardNumber);
  const expirationDate = document.getElementById('expirationDate').value.trim();
  const cvv = document.getElementById('cvv').value.trim();

  console.log("Card Number:", cardNumber);
  console.log("Card Type:", cardType);
  console.log("Expiration Date:", expirationDate);
  console.log("CVV:", cvv);

  if (!cardNumber || !cardType || !expirationDate || !cvv) {
    console.log("Validation failed, missing fields");
    alert('Please fill out all fields correctly.');
    return;
  }

  // Get the current user
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User is authenticated:", user.uid);
      
      // Check if card already exists
      if (await cardExists(user, cardNumber)) {
        console.log("Card already exists");
        alert('This card is already linked to your account.');
        return;
      }

      try {
        // Add card to Firestore subcollection
        console.log("Adding card to Firestore subcollection for user:", user.uid);
        await addDoc(collection(db, 'users', user.uid, 'cards'), {
          cardNumber: cardNumber,
          cardType: cardType,
          expirationDate: expirationDate,
          cvv: cvv
        });
        console.log("Card linked successfully");
        alert('Card linked successfully!');
        window.location.href = "Account.html";
        // Optionally, reset the form inputs
        resetFormInputs();
      } catch (error) {
        console.error('Error adding card:', error);
        alert('Error linking card. Please try again.');
      }
    } else {
      console.log("User is not authenticated");
      alert('You need to be signed in to link a card.');
    }
  });
});
