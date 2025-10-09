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
    window.location.href = "login-page-desktop.html";
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




document.getElementById('finalstep').addEventListener('click', async function() {
  if (!selectedUser || !auth.currentUser) {
    alert('Please make sure a user is selected and you are logged in.');
    return;
  }

  const amount = parseFloat(document.getElementById('inputforamount').value.trim());
  const selectedCurrency = document.getElementById('currencySelect').value;
  const userId = auth.currentUser.uid;

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

  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    console.error('User document not found');
    return;
  }

  const userData = userDoc.data();

  const transactionDetails = {
    date: new Date(),
    type: "Requesting from",
    amount: amount,
    sender: userId,
    receiver: receiverId,
    currency: selectedCurrency,
    paymentMethod: 'accountbalance'
  };
  
  try {
    await addDoc(collection(db, 'users', userId, 'Transactions'), transactionDetails);
    await addDoc(collection(db, 'users', receiverId, 'Transactions'), transactionDetails);
  
    // Send a notification to the receiver's notifications subcollection
    const notification = {
      senderId: userId,
      type: "request",
      amount: amount,
      currency: selectedCurrency,
      timestamp: new Date(),
      readStatus: false
    };
    await addDoc(collection(db, 'users', receiverId, 'notifications'), notification);
  
    // Update sender balance
    await updateDoc(doc(db, 'users', userId), {
      balance: userData.balance + amount
    });
  
    // Update receiver balance
    const receiverDoc = await getDoc(doc(db, 'users', receiverId));
    if (receiverDoc.exists()) {
      const receiverData = receiverDoc.data();
      await updateDoc(doc(db, 'users', receiverId), {
        balance: receiverData.balance - amount
      });
    }
  
    const successMessage = `You’ve Requested ${amount.toFixed(2)} ${selectedCurrency} from ${selectedUser}`;
    document.getElementById('successMessage').textContent = successMessage;
    const amountInputSection = document.getElementById('amountInputSection');
    amountInputSection.style.display = 'none';
    document.getElementById('messagesuc').style.display = 'contents';
  
  } catch (error) {
    console.error('Error adding transaction or notification:', error);
    alert('Failed to add transaction or notification.');
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

