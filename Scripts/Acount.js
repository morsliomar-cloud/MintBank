// Ensure Firebase is initialized only once
if (!firebase.apps.length) {
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
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Function to fetch and display user data
async function fetchUserData(user) {
    console.log('Fetching user data for user:', user.uid);
    try {
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('User data:', userData);
            document.getElementById('users-name').innerText = userData.name;
            document.getElementById('Balance').innerText = `${userData.balance} ${userData.currency}`;
            await fetchSubCollections(user);
            await fetchRecentActivities(user);
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error getting document:', error);
    }
}

// Function to fetch subcollections (cards and bankAccounts) and display them
async function fetchSubCollections(user) {
    const accountOptionsContainer = document.querySelector('.frame-container');
    accountOptionsContainer.innerHTML = ''; // Clear existing options

    try {
        const cardsSnapshot = await db.collection('users').doc(user.uid).collection('cards').get();
        const bankAccountsSnapshot = await db.collection('users').doc(user.uid).collection('bankAccounts').get();

        cardsSnapshot.forEach((doc) => {
            const cardData = doc.data();
            console.log('Card data:', cardData);
            createAccountLabel(cardData.cardType, cardData.cardNumber, 'card', accountOptionsContainer);
        });

        bankAccountsSnapshot.forEach((doc) => {
            const bankData = doc.data();
            console.log('Bank data:', bankData);
            createAccountLabel(bankData.bankName, bankData.accountNumber, 'bank', accountOptionsContainer);
        });
    } catch (error) {
        console.error('Error fetching subcollections:', error);
    }
}

// Function to create a label for card or bank account
function createAccountLabel(type, number, accountType, container) {
    const lastFourDigits = number.slice(-4);
    const displayText = `${type} ending in ${lastFourDigits}`;
    const defaultImageSrc = accountType === 'card' ? 'public/icons8-credit-64.png' : 'public/icons8-merchant-account-100.png';

    const label = document.createElement('label');
    label.className = 'radio-label';
    label.innerHTML = `
        <input type="radio" name="options" value="${displayText}" />
        <img class="shape-30-icon15" loading="lazy" alt="" src="${defaultImageSrc}" />
        <span class="radio-text">${displayText}</span>
    `;

    container.appendChild(label);
}

// Function to fetch recent activities and display them
async function fetchRecentActivities(user) {
    const recentActivityContainer = document.querySelector('.container40');
    const noActivityElement = document.getElementById('noact');
    recentActivityContainer.innerHTML = '<h1 class="heading32">Recent Activity</h1>'; // Reset content with heading
    const actpage = document.getElementById("Activity");

    try {
        const transactionsSnapshot = await db.collection('users').doc(user.uid).collection('Transactions').orderBy('date', 'desc').limit(3).get();
        
        if (transactionsSnapshot.empty) {
            const transactionElement = document.createElement('h2');
                transactionElement.className = 'heading33';
                transactionElement.innerText = "there is no activity....";
                recentActivityContainer.appendChild(transactionElement);
        } else {
            noActivityElement.style.display = 'none';
            transactionsSnapshot.forEach((doc) => {
                const transactionData = doc.data();
                console.log('Transaction data:', transactionData);
                const transactionElement = document.createElement('h2');
                transactionElement.className = 'heading33';
                transactionElement.innerText = `Date: ${transactionData.date.toDate().toLocaleString()}, Amount: ${transactionData.amount} ${transactionData.currency}, Type: ${transactionData.type}`;
                recentActivityContainer.appendChild(transactionElement);
            });
        }

        // Add the "All Activities" button
        const allActivitiesButton = document.createElement('button');
        allActivitiesButton.className = 'button65';
        allActivitiesButton.id = 'Activity';
        allActivitiesButton.addEventListener('click', () => {
            window.location.href = 'Activity.html';
        });
        allActivitiesButton.innerHTML = '<div class="text48">All Activities</div>';
        recentActivityContainer.appendChild(allActivitiesButton);
    } catch (error) {
        console.error('Error fetching recent activities:', error);
    }
}

// Auth state listener
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        console.log('User is signed in:', user);
        await fetchUserData(user);
    } else {
        console.log('No user is signed in. Redirecting to login page.');
        window.location.href = 'Login.html'; // Redirect to login page
    }
});

// Add event listener for button click
document.getElementById('button1').addEventListener('click', () => {
    document.getElementById('main').style.display = 'none';
    document.getElementById('inputamount').style.display = 'contents';
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

document.getElementById('next1').addEventListener('click', async () => {
    const inputValue = parseFloat(document.getElementById('inputforamount').value);
    if (inputValue > 0) {
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                const cardsSnapshot = await db.collection('users').doc(user.uid).collection('cards').get();
                const bankAccountsSnapshot = await db.collection('users').doc(user.uid).collection('bankAccounts').get();

                if (cardsSnapshot.empty && bankAccountsSnapshot.empty) {
                    document.getElementById('popup').style.display = '';
                    document.getElementById('maincontent').style.display = 'none';
                } else {
                    document.getElementById('inputamount').style.display = 'none';
                    document.getElementById('paymenttype').style.display = 'contents';
                    console.log('User has cards or bank accounts, proceeding...');
                    // Add your logic here for the "Next" button functionality
                }
            } else {
                console.log('No user is signed in.');
            }
        } catch (error) {
            console.error('Error checking user accounts:', error);
        }
    } else {
        alert('Please enter an amount greater than 0.');
    }
});

// Event listener for the "Next2" button
document.getElementById('Next2').addEventListener('click', async () => {
    console.log('Next2 button clicked');
    const selectedPaymentMethod = document.querySelector('.frame-container input[name="options"]:checked');
    const inputValue = parseFloat(document.getElementById('inputforamount').value);
    const user = firebase.auth().currentUser;

    console.log('Selected payment method:', selectedPaymentMethod);
    console.log('Input value:', inputValue);
    console.log('User:', user);

    if (selectedPaymentMethod) {
        if (inputValue > 0 && user) {
            try {
                const userDocRef = db.collection('users').doc(user.uid);
                const userDoc = await userDocRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const userCurrency = userData.currency;
                    const currentBalance = parseFloat(userData.balance);
                    const newBalance = currentBalance + inputValue;

                    console.log('Current balance:', currentBalance);
                    console.log('New balance:', newBalance);

                    // Update the user's balance in Firestore
                    await userDocRef.update({ balance: newBalance });

                    const successMessage = `You’ve Added ${inputValue.toFixed(2)} ${userCurrency} to your MintBank balance`;

                    document.getElementById('messagesuc').style.display = 'contents';
                    document.getElementById('paymenttype').style.display = 'none';
                    document.getElementById('successMessage').innerText = successMessage;

                    // Update the balance displayed on the page
                    document.getElementById('Balance').innerText = `${newBalance.toFixed(2)} ${userCurrency}`;
                } else {
                    console.log('User document does not exist.');
                }
            } catch (error) {
                console.error('Error updating balance:', error);
            }
        } else {
            alert('Please select a payment method and enter a valid amount.');
        }
    } else {
        alert('Please select a payment method.');
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

// Reset input value when reloading the page
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('inputforamount').value = '0.00';
});

// Event listener for the "Backbutton" button
document.getElementById('BackButton').addEventListener('click', () => {
    document.getElementById('paymenttype').style.display = 'none';
    document.getElementById('inputamount').style.display = 'contents';
});
