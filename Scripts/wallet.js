// Import necessary Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import { getFirestore, collection, getDoc, doc, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBS-E-W1L3XK7stlVsS1c02FRzCBSA1zsE",
    authDomain: "pfep-9ded1.firebaseapp.com",
    projectId: "pfep-9ded1",
    storageBucket: "pfep-9ded1.appspot.com",
    messagingSenderId: "333176142301",
    appId: "1:333176142301:web:afced671374fc979e35e34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to create a card or bank account element
function createCardBankElement(isCard, name, info, id) {
    const containerDiv = document.createElement('div');
    containerDiv.className = 'cardbank-container';

    const img = document.createElement('img');
    img.className = 'shape-30-icon18';
    img.alt = '';
    img.src = isCard ? './public/icons8-credit-64.png' : './public/icons8-merchant-account-100.png';

    const paymentMethodInfoDiv = document.createElement('div');
    paymentMethodInfoDiv.className = 'payment-method-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = name;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'info';
    infoDiv.textContent = `•••${info}`;

    paymentMethodInfoDiv.appendChild(nameDiv);
    paymentMethodInfoDiv.appendChild(infoDiv);

    containerDiv.appendChild(img);
    containerDiv.appendChild(paymentMethodInfoDiv);

    // Add event listener for click event
    containerDiv.addEventListener('click', () => displayRightSide(isCard, name, info, id));

    return containerDiv;
}

// Function to fetch and display payment methods for the current user
async function fetchPaymentMethods(userId) {
    const cardsAndBanksDiv = document.querySelector('.cards-and-bankds');
    // Preserve the default option element
    const defaultOpt = document.querySelector('.default-opt');
    // Clear existing items except the default option
    cardsAndBanksDiv.innerHTML = '';
    if (defaultOpt) {
        cardsAndBanksDiv.appendChild(defaultOpt);
    }

    try {
        // Fetch and display cards
        const cardsCollection = collection(db, `users/${userId}/cards`);
        const cardsSnapshot = await getDocs(cardsCollection);
        let hasPaymentMethods = false;

        cardsSnapshot.forEach((cardDoc) => {
            const cardData = cardDoc.data();
            const cardElement = createCardBankElement(true, cardData.cardType, cardData.cardNumber.slice(-4), cardDoc.id);
            cardsAndBanksDiv.appendChild(cardElement);
            hasPaymentMethods = true;
        });

        // Fetch and display bank accounts
        const bankAccountsCollection = collection(db, `users/${userId}/bankAccounts`);
        const bankAccountsSnapshot = await getDocs(bankAccountsCollection);

        bankAccountsSnapshot.forEach((accountDoc) => {
            const accountData = accountDoc.data();
            const bankAccountElement = createCardBankElement(false, accountData.bankName, accountData.routingNumber.slice(-4), accountDoc.id);
            cardsAndBanksDiv.appendChild(bankAccountElement);
            hasPaymentMethods = true;
        });

        // Hide elements if user has at least one payment method
        if (hasPaymentMethods) {
            document.getElementById('c1').style.display = 'none';
            document.getElementById('line').style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching payment methods:', error);
    }
}

// Function to fetch and display user balance
async function fetchUserBalance(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const balanceElement = document.getElementById('balance');
            balanceElement.textContent = `${userData.balance} ${userData.currency} Available`;
        } else {
            console.error('No such document!');
        }
    } catch (error) {
        console.error('Error fetching user balance:', error);
    }
}

// Function to display the right-side element with card or bank details
function displayRightSide(isCard, name, info, id) {
    // Remove any existing right-side element
    const existingRightSide = document.querySelector('.right-side');
    if (existingRightSide) {
        existingRightSide.remove();
    }

    // Create the right-side element
    const rightSideDiv = document.createElement('div');
    rightSideDiv.className = 'right-side';

    const img = document.createElement('img');
    img.className = 'image-2-icon';
    img.loading = 'lazy';
    img.alt = '';
    img.src = isCard ? './public/Wallet-card.png' : './public/Wallet-bank.png';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = `${name} •••${info}`;

    const buttonParentDiv = document.createElement('div');
    buttonParentDiv.className = 'button-parent1';

    const removeButton = document.createElement('button');
    removeButton.className = 'button85';
    removeButton.id = 'removebutton';
    const removeText = document.createElement('div');
    removeText.className = 'text69';
    removeText.textContent = isCard ? 'Remove Card' : 'Remove Account';
    removeButton.appendChild(removeText);

    buttonParentDiv.appendChild(removeButton);

    rightSideDiv.appendChild(img);
    rightSideDiv.appendChild(nameDiv);
    rightSideDiv.appendChild(buttonParentDiv);

    // Insert the right-side element after the section2 element
    const section2 = document.querySelector('.section2');
    section2.appendChild(rightSideDiv);

    // Add event listener for remove button
    removeButton.addEventListener('click', async () => {
        await removePaymentMethod(isCard, id);
        rightSideDiv.remove();
        // Reload the payment methods to reflect changes
        fetchPaymentMethods(auth.currentUser.uid);
    });
}

// Function to remove a payment method
async function removePaymentMethod(isCard, id) {
    const userId = auth.currentUser.uid;
    const collectionPath = isCard ? `users/${userId}/cards` : `users/${userId}/bankAccounts`;
    try {
        await deleteDoc(doc(db, collectionPath, id));
        console.log('Payment method removed successfully');
    } catch (error) {
        console.error('Error removing payment method:', error);
    }
}

// Fetch payment methods and user balance on page load
window.onload = () => {
    onAuthStateChanged(auth, user => {
        if (user) {
            fetchPaymentMethods(user.uid);
            fetchUserBalance(user.uid);
        } else {
            // Redirect to the login page if the user is not logged in
            window.location.replace('Login.html'); // Adjust the URL to your login page
        }
    });
};
