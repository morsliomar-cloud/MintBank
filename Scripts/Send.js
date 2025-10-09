import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase configuration
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
console.log("Firebase initialized");

// Initialize Firestore
const db = getFirestore(app);
console.log("Firestore initialized");

// Initialize Firebase Auth
const auth = getAuth(app);
console.log("Firebase Auth initialized");

// Initialize Firebase Storage
const storage = getStorage(app);
console.log("Firebase Storage initialized");

// Store current user ID
let currentUserId = null;

// Authentication state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user);
    currentUserId = user.uid; // Store the current user's ID
    loadOldPfp(user.uid); // Pass authenticated user's ID
  } else {
    // User is signed out
    console.log('User is signed out');
    window.location.href = "Login.html";
    // Redirect to login page or show login form
  }
});

async function loadOldPfp(userId) {
  try {
    console.log("Loading old profile picture for user ID:", userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      console.log("User document found:", userDoc.data());
      const userData = userDoc.data();
      const oldPfpUrl = userData.profilePictureUrl;
      console.log("Old profile picture URL:", oldPfpUrl);
      return oldPfpUrl; // Return the URL
    } else {
      console.log('No such document!');
      return null; // Return null if the document does not exist
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return null; // Return null in case of an error
  }
}

// Function to search users
const searchUsers = async (queryText) => {
  console.log("Searching for users with query:", queryText);

  const q = query(collection(db, "users"), where("name", ">=", queryText), where("name", "<=", queryText + "\uf8ff"));
  const snapshot = await getDocs(q);

  const users = [];
  snapshot.forEach((doc) => {
    // Exclude the current user from the search results
    if (doc.id !== currentUserId) {
      users.push(doc.data());
    }
  });
  return users;
};

let selectedUser = null; // Variable to store the selected user

// Event listener for input field
document.querySelector('.user-input').addEventListener('input', async (event) => {
  const queryText = event.target.value;
  const container2 = document.getElementById('container2');

  // Search for users only if queryText is not empty
  if (queryText.trim().length > 0) {
    const users = await searchUsers(queryText);

    // Show container2 only if users are found
    if (users.length > 0) {
      container2.style.display = 'block';
      console.log("Query:", queryText);

      const frameContainer = document.getElementById('frameContainer2');
      frameContainer.innerHTML = ''; // Clear previous results

      users.forEach((user) => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('USER'); // Use class instead of id
        userDiv.dataset.userName = user.name; // Store user name in data attribute
        userDiv.dataset.userPfpUrl = user.profilePictureUrl || 'public/blankprofilepicture973460-1280-cropped-1@2x.png'; // Store user PFP URL in data attribute

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('bio');
        infoDiv.dataset.userName = user.name; // Store user name in data attribute
        infoDiv.dataset.userPfpUrl = user.profilePictureUrl || 'public/blankprofilepicture973460-1280-cropped-1@2x.png'; // Store user PFP URL in data attribute

        const userLocationDiv = document.createElement('div');
        userLocationDiv.classList.add('user-location');
        userLocationDiv.textContent = user.name;
        userLocationDiv.dataset.userName = user.name; // Store user name in data attribute
        userLocationDiv.dataset.userPfpUrl = user.profilePictureUrl || 'public/blankprofilepicture973460-1280-cropped-1@2x.png'; // Store user PFP URL in data attribute
        infoDiv.appendChild(userLocationDiv);

        const userStatusDiv = document.createElement('div');
        userStatusDiv.classList.add('user-status');
        userStatusDiv.textContent = '@' + user.username;
        userStatusDiv.dataset.userName = user.name; // Store user name in data attribute
        userStatusDiv.dataset.userPfpUrl = user.profilePictureUrl || 'public/blankprofilepicture973460-1280-cropped-1@2x.png'; // Store user PFP URL in data attribute
        infoDiv.appendChild(userStatusDiv);

        const userImageDiv = document.createElement('img');
        userImageDiv.classList.add('user-image');
        userImageDiv.id = 'user-image';
        userImageDiv.src = user.profilePictureUrl || 'public/blankprofilepicture973460-1280-cropped-1@2x.png';
        userImageDiv.dataset.userName = user.name; // Store user name in data attribute
        userImageDiv.dataset.userPfpUrl = user.profilePictureUrl || 'public/blankprofilepicture973460-1280-cropped-1@2x.png'; // Store user PFP URL in data attribute
        console.log("Profile picture loaded successfully.");
        userDiv.appendChild(userImageDiv);
        userDiv.appendChild(infoDiv);
        frameContainer.appendChild(userDiv);
      });
    } else {
      // Hide container2 if no users are found
      container2.style.display = 'none';
      console.log("No matching users found.");
    }
  } else {
    // Hide container2 if queryText is empty
    container2.style.display = 'none';
    console.log("Query is empty. Hiding container2.");
  }
});

// Event delegation to handle clicks on dynamically created USER, user-image, and bio elements
document.addEventListener('click', function(event) {
  if (event.target && (event.target.classList.contains('USER') || event.target.classList.contains('user-image') || event.target.classList.contains('user-status') || event.target.classList.contains('user-location') || event.target.classList.contains('bio'))) {
    const container2 = document.getElementById('container2');
    const input = document.querySelector('.user-input'); // Update to use your actual input class
    const image = document.getElementById('image'); // Image element to update
    const name = document.getElementById('nextname');
    const username = document.getElementById('nextusername');

    // Get the user name and profile picture URL from the data attribute
    const userName = event.target.dataset.userName;
    const userPfpUrl = event.target.dataset.userPfpUrl;

    if (userName && userPfpUrl) {
      input.value = userName;
      image.src = userPfpUrl;
      selectedUser = userName; // Set the selected user
      name.textContent = userName;
      username.textContent = '@' + userName;
    }

    container2.style.display = 'none';
    console.log("User clicked:", userName);
  }
});

// Make the Next button work only when a user is selected
var nextButton = document.querySelector(".button1");
var userInputSection = document.getElementById("userInputSection");
var amountInputSection = document.getElementById("amountInputSection");

// Check if the nextButton exists
if (nextButton) {
  nextButton.addEventListener("click", function (e) {
    // Prevent the default button action
    e.preventDefault();

    // Check if a user has been selected
    if (selectedUser) {
      // Hide the user input section
      userInputSection.style.display = "none";
      // Show the amount input section
      amountInputSection.style.display = "contents";
    } else {
      alert('Please select a user first.');
    }
  });
}

// Event listener for the button with the ID Next2
document.getElementById('Next2').addEventListener('click', async function () {
  const amount = document.getElementById('inputforamount').value.trim();

  // Check if the amount is a valid number greater than 0
  if (!isNaN(amount) && parseFloat(amount) > 0) {
    console.log("Next2 button clicked");
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    if (!userId) {
      console.error("No authenticated user found");
      return;
    }

    console.log("Authenticated user ID:", userId);

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data retrieved:", userData);

        const userBalance = userData.balance;
        console.log("User balance:", userBalance);

        const hasPaymentMethod = await hasCardOrBankAccount(userId);
        console.log("User has payment method:", hasPaymentMethod);

        if (userBalance > 0 || hasPaymentMethod) {
          console.log("Conditions met, showing paymenttype and hiding amountInputSection");
          await loadPaymentMethods(); // Load payment methods dynamically
          document.getElementById('paymenttype').style.display = 'block';
          document.getElementById('amountInputSection').style.display = 'none';
        } else if (userBalance === 0 && !hasPaymentMethod) {
          console.log("User has no balance and no payment method, showing popup and hiding main");
          document.getElementById('popup').style.display = '';
          document.getElementById('main').style.display = 'none';
        } else {
          console.log("Conditions not met for displaying paymenttype, no changes to display");
        }
      } else {
        console.log('User document not found');
      }
    } catch (error) {
      console.error('Error fetching user document or checking payment methods:', error);
    }
  } else {
    alert('Please enter a valid amount greater than 0');
    console.log('Invalid amount entered:', amount);
  }
});

// Function to check if the user has a card or bank account
async function hasCardOrBankAccount(userId) {
  try {
    const cardQuery = query(collection(db, 'users', userId, 'cards'));
    const bankAccountQuery = query(collection(db, 'users', userId, 'bankAccounts'));

    const [cardSnapshot, bankAccountSnapshot] = await Promise.all([
      getDocs(cardQuery),
      getDocs(bankAccountQuery)
    ]);

    const hasCard = !cardSnapshot.empty;
    const hasBankAccount = !bankAccountSnapshot.empty;

    return hasCard || hasBankAccount;
  } catch (error) {
    console.error('Error checking payment methods:', error);
    return false;
  }
}

// Initialize payment methods load when the page is ready
document.addEventListener('DOMContentLoaded', function () {
  loadPaymentMethods();
});





// Function to load available payment methods
async function loadPaymentMethods() {
  try {
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    if (!userId) {
      console.error("No authenticated user found");
      return;
    }

    console.log("Authenticated user ID:", userId);

    const cardQuery = query(collection(db, 'users', userId, 'cards'));
    const bankAccountQuery = query(collection(db, 'users', userId, 'bankAccounts'));

    const [cardSnapshot, bankAccountSnapshot] = await Promise.all([
      getDocs(cardQuery),
      getDocs(bankAccountQuery)
    ]);

    const paymentMethodsContainer = document.querySelector('.frame-container');

    cardSnapshot.forEach((doc) => {
      const cardData = doc.data();
      const cardElement = createPaymentMethodElement(cardData.cardType + " ending in " + cardData.lastFourDigits, "public/icons8-credit-64.png", doc.id);
      paymentMethodsContainer.appendChild(cardElement);
    });

    bankAccountSnapshot.forEach((doc) => {
      const bankAccountData = doc.data();
      const bankElement = createPaymentMethodElement(bankAccountData.bankName + " ending in " + bankAccountData.lastFourDigits, "public/icons8-merchant-account-100.png", doc.id);
      paymentMethodsContainer.appendChild(bankElement);
    });
  } catch (error) {
    console.error('Error loading payment methods:', error);
  }
}


// Function to create payment method elements
function createPaymentMethodElement(name, iconUrl, docId, type) {
  const label = document.createElement('label');
  label.classList.add('radio-label');

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'options';
  input.value = name;
  input.dataset.docId = docId; // Add the document ID as a data attribute

  const icon = document.createElement('img');
  icon.classList.add('shape-30-icon15');
  icon.loading = 'lazy';
  icon.alt = '';

  // Check the type and set the default icon if iconUrl is not provided
  if (iconUrl) {
    icon.src = iconUrl;
  } else if (type === 'card') {
    icon.src = 'creditcard.png';
  } else if (type === 'bankAccount') {
    icon.src = 'bank.png';
  }

  const span = document.createElement('span');
  span.classList.add('radio-text');
  span.textContent = name;

  label.appendChild(input);
  label.appendChild(icon);
  label.appendChild(span);

  return label;
}



// Initialize payment methods load when the page is ready
document.addEventListener('DOMContentLoaded', function () {
  loadPaymentMethods();
});

// Event listener for the Back button
document.querySelector('.text-button103').addEventListener('click', function () {
  document.getElementById('paymenttype').style.display = 'none';
  document.getElementById('amountInputSection').style.display = 'contents';
  console.log("Back button clicked, returning to amount input section");
});


// Event listener for the Next3 button
document.getElementById('Next3').addEventListener('click', function () {
  const selectedPaymentMethod = document.querySelector('input[name="options"]:checked');
  
  if (!selectedPaymentMethod) {
    alert("Please select a payment method before proceeding.");
    return;
  }

  const operationrapport = document.getElementById('operationrapport');
  const paymenttype = document.getElementById('paymenttype');
  const container42 = document.getElementById('container42');

  const selectedPfpUrl = document.getElementById('image').src;
  const selectedName = document.getElementById('nextname').textContent; // Assuming this contains the user name
  const inputAmount = document.getElementById('inputforamount').value;
  const selectedCurrency = document.getElementById('currencySelect').value; // Assuming this is the correct selector for currency drop-down

  // Show the selected user details in the operation rapport
  const userPfpElement = operationrapport.querySelector('.blank-profile-picture-973460-1-icon'); // Assuming there's an element with class 'user-pfp' in operationrapport
  const userNameElement = operationrapport.querySelector('.name9, .username'); // Assuming there's an element with class 'user-name' in operationrapport
  const showInputAmountElement = operationrapport.querySelector('#showinputamount'); // Assuming this is the correct selector for the element
  const pastCurrencyElement = operationrapport.querySelector('#pastcurrency'); // Assuming this is the correct selector for the element

  // Update the payment method details in the operation rapport
  const paymentMethodImageElement = operationrapport.querySelector('.shape-30-icon16'); // Assuming this is the correct selector for the payment method image element
  const paymentMethodTextElement = operationrapport.querySelector('.text-button106'); // Assuming this is the correct selector for the payment method text element
  const amountWithCurrencyElements = operationrapport.querySelectorAll('.text-button107, .text-button109'); // Assuming these are the correct selectors for the amount with currency elements

  // Update the elements with the selected details
  if (userPfpElement) {
    userPfpElement.src = selectedPfpUrl;
  } else {
    console.error('userPfpElement is null');
  }

  if (userNameElement) {
    userNameElement.textContent = selectedName;
  } else {
    console.error('userNameElement is null');
  }

  if (showInputAmountElement) {
    showInputAmountElement.textContent = inputAmount;
  } else {
    console.error('showInputAmountElement is null');
  }

  if (pastCurrencyElement) {
    pastCurrencyElement.textContent = selectedCurrency;
  } else {
    console.error('pastCurrencyElement is null');
  }

  if (paymentMethodImageElement) {
    paymentMethodImageElement.src = selectedPaymentMethod.nextElementSibling.src; // Assuming the payment method image is the next sibling of the input
  } else {
    console.error('paymentMethodImageElement is null');
  }

  if (paymentMethodTextElement) {
    paymentMethodTextElement.textContent = selectedPaymentMethod.value;
  } else {
    console.error('paymentMethodTextElement is null');
  }

  amountWithCurrencyElements.forEach(element => {
    if (element) {
      element.textContent = `${inputAmount} ${selectedCurrency}`;
    } else {
      console.error('amountWithCurrencyElement is null');
    }
  });

  // Update display styles
  operationrapport.style.display = 'contents';
  paymenttype.style.display = 'none';

  console.log("Next3 button clicked, displaying operationrapport and updating footer with user details and amount");
});


document.getElementById('finalstep').addEventListener('click', async function() {
  // Check if the selected user and amount are defined
  if (!selectedUser || !auth.currentUser) {
    alert('Please make sure a user is selected and you are logged in.');
    return;
  }

  const amount = parseFloat(document.getElementById('inputforamount').value.trim());
  const selectedCurrency = document.getElementById('currencySelect').value;
  const userId = auth.currentUser.uid;
  const selectedPaymentMethod = document.querySelector('input[name="options"]:checked');

  if (!selectedPaymentMethod) {
    alert("Please select a payment method before proceeding.");
    return;
  }

  // Get the selected user's document ID
  const userQuery = query(collection(db, "users"), where("name", "==", selectedUser));
  const userSnapshot = await getDocs(userQuery);
  let receiverId = null;

  userSnapshot.forEach((doc) => {
    if (doc.data().name === selectedUser) {
      receiverId = doc.id;
    }
  });

  if (!receiverId) {
    console.error('Selected user not found in the database');
    return;
  }

  // Fetch the current user document
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    console.error('User document not found');
    return;
  }

  const userData = userDoc.data();
  const userBalance = userData.balance;

  // Check if the selected payment method is account balance and if the balance is sufficient
  if (selectedPaymentMethod.id === 'accountbalance' && userBalance < amount) {
    alert('Insufficient balance. Please select another payment method.');
    return;
  }

  // Get the payment method document ID
  let paymentMethodId;
  if (selectedPaymentMethod.id === 'accountbalance') {
    paymentMethodId = 'accountbalance';
  } else {
    paymentMethodId = selectedPaymentMethod.dataset.docId; // Use the document ID from the data attribute
  }

  // Define the transaction details
  const transactionDetails = {
    date: new Date(),
    type: "Sending to",
    amount: amount,
    sender: userId,
    receiver: receiverId,
    currency: selectedCurrency,
    paymentMethod: paymentMethodId
  };

  // Add the transaction to the Transactions subcollection
  try {
    await addDoc(collection(db, 'users', userId, 'Transactions'), transactionDetails);
    await addDoc(collection(db, 'users', receiverId, 'Transactions'), transactionDetails);

    // Update the balance if payment method is account balance
    if (selectedPaymentMethod.id === 'accountbalance') {
      await updateDoc(doc(db, 'users', userId), {
        balance: userBalance - amount,
      });

      // Fetch the receiver's current balance
      const receiverDoc = await getDoc(doc(db, 'users', receiverId));
      if (receiverDoc.exists()) {
        const receiverData = receiverDoc.data();
        const receiverBalance = receiverData.balance;

        // Update the receiver's balance
        await updateDoc(doc(db, 'users', receiverId), {
          balance: receiverBalance + amount,
        });
      }
    }

    console.log('Transaction successfully added:', transactionDetails);

    // Update and display the success message
    const operationrapport = document.getElementById('operationrapport');
    const successMessage = `You’ve sent ${amount.toFixed(2)} ${selectedCurrency} to ${selectedUser}`;
    document.getElementById('successMessage').textContent = successMessage;
    operationrapport.style.display = 'none';
    document.getElementById('messagesuc').style.display = 'contents';

  } catch (error) {
    console.error('Error adding transaction:', error);
    alert('Failed to add transaction.');
  }
});


// Function to handle input for amount
document.getElementById('inputforamount').addEventListener('input', (event) => {
  let value = event.target.value.replace(/[^0-9]/g, ''); // Remove non-digit characters
  if (value.length < 3) {
    value = value.padStart(3, '0'); // Ensure the string is at least 3 characters long
  }
  const integerPart = value.slice(0, -2);
  const decimalPart = value.slice(-2);
  const formattedValue = `${integerPart}.${decimalPart}`.replace(/^0+(?=\d)/, ''); // Remove leading zeros
  event.target.value = formattedValue;
});

document.getElementById('inputforamount').addEventListener('focus', (event) => {
  if (event.target.value === '0.00') {
    event.target.value = '';
  }
});

document.getElementById('inputforamount').addEventListener('blur', (event) => {
  if (event.target.value === '' || event.target.value === '0.') {
    event.target.value = '0.00';
  }
});

// Event listener for the change button in the operationrapport section
document.getElementById('changemethode').addEventListener('click', function() {
  document.getElementById('operationrapport').style.display = 'none';
  document.getElementById('paymenttype').style.display = 'block';
  console.log("Change button clicked, displaying paymenttype and hiding operationrapport");
});
