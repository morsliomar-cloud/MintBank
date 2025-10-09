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
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const firestore = firebase.firestore();
  
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
  
    const renderLogin = () => {
      root.innerHTML = `
        <div>
          <h2>Admin Login</h2>
          <form id="login-form">
            <input type="email" id="email" placeholder="Email" required />
            <input type="password" id="password" placeholder="Password" required />
            <button type="submit">Sign In</button>
          </form>
          <p id="error-message" style="color: red;"></p>
        </div>
      `;
  
      const loginForm = document.getElementById('login-form');
      const errorMessage = document.getElementById('error-message');
  
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
  
        auth.signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            return firestore.collection('users').doc(user.uid).get();
          })
          .then((doc) => {
            if (doc.exists && doc.data().admin) {
              renderDashboard();
            } else {
              auth.signOut();
              errorMessage.textContent = "You do not have admin privileges.";
            }
          })
          .catch((error) => {
            errorMessage.textContent = error.message;
          });
      });
    };
  
    const renderDashboard = async () => {
      const currentUser = auth.currentUser;
      const usersSnapshot = await firestore.collection('users').get();
      const usersList = usersSnapshot.docs
        .filter(doc => doc.id !== currentUser.uid)
        .map(doc => ({ id: doc.id, ...doc.data() }));
  
      root.innerHTML = `
        <div>
          <h2>Admin Dashboard</h2>
          <div>
            <h3>Users</h3>
            <ul id="users-list">
              ${usersList.map(user => `
                <li data-id="${user.id}">
                  ${user.name} (${user.email})
                  <button class="delete-user-btn">Delete</button>
                </li>
              `).join('')}
            </ul>
          </div>
          <div id="transactions-section">
            <h3>Transactions</h3>
            <ul id="transactions-list"></ul>
          </div>
          <div id="payment-methods-section">
            <h3>Payment Methods</h3>
            <ul id="payment-methods-list"></ul>
          </div>
        </div>
      `;
  
      document.querySelectorAll('#users-list li').forEach(li => {
        li.addEventListener('click', (e) => {
          if (e.target.classList.contains('delete-user-btn')) {
            deleteUser(li.dataset.id);
          } else {
            fetchTransactions(li.dataset.id);
            fetchPaymentMethods(li.dataset.id);
          }
        });
      });
    };
  
    const fetchTransactions = async (userId) => {
      const transactionsSnapshot = await firestore.collection('users').doc(userId).collection('Transactions').get();
      const transactionsList = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      const transactionsListElement = document.getElementById('transactions-list');
      const transactionPromises = transactionsList.map(async (transaction) => {
        let paymentDetails = transaction.paymentMethod;
  
        if (transaction.paymentMethod !== "accountbalance") {
          try {
            const cardDoc = await firestore.collection('users').doc(userId).collection('cards').doc(transaction.paymentMethod).get();
            if (cardDoc.exists) {
              const cardData = cardDoc.data();
              paymentDetails = `${cardData.cardNumber} (${cardData.cardType})`;
            } else {
              const bankDoc = await firestore.collection('users').doc(userId).collection('bankAccounts').doc(transaction.paymentMethod).get();
              if (bankDoc.exists) {
                const bankData = bankDoc.data();
                paymentDetails = `${bankData.accountNumber} (${bankData.bankName})`;
              } else {
                paymentDetails = 'Invalid payment method';
              }
            }
          } catch (error) {
            paymentDetails = 'Invalid payment method';
          }
        }
  
        return `
          <li data-id="${transaction.id}" data-user-id="${userId}">
            Amount: ${transaction.amount}; 
            Payment Method: ${paymentDetails}; 
            Transaction Type: ${transaction.type}
            <button class="delete-transaction-btn">Delete</button>
          </li>
        `;
      });
  
      const transactionsHtml = await Promise.all(transactionPromises);
      transactionsListElement.innerHTML = transactionsHtml.join('');
  
      document.querySelectorAll('.delete-transaction-btn').forEach(button => {
        button.addEventListener('click', () => deleteTransaction(userId, button.closest('li').dataset.id));
      });
    };
  
    const fetchPaymentMethods = async (userId) => {
      const cardsSnapshot = await firestore.collection('users').doc(userId).collection('cards').get();
      const bankAccountsSnapshot = await firestore.collection('users').doc(userId).collection('bankAccounts').get();
  
      const cardsList = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const bankAccountsList = bankAccountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      const paymentMethodsList = [...cardsList, ...bankAccountsList].map(paymentMethod => {
        if (paymentMethod.cardNumber) {
          return `
            <li data-id="${paymentMethod.id}">
              ${paymentMethod.cardNumber} (${paymentMethod.cardType})
              <button class="delete-payment-method-btn">Delete</button>
            </li>`;
        } else {
          return `
            <li data-id="${paymentMethod.id}">
              ${paymentMethod.accountNumber} (${paymentMethod.bankName})
              <button class="delete-payment-method-btn">Delete</button>
            </li>`;
        }
      });
  
      const paymentMethodsListElement = document.getElementById('payment-methods-list');
      paymentMethodsListElement.innerHTML = paymentMethodsList.join('');
  
      document.querySelectorAll('.delete-payment-method-btn').forEach(button => {
        button.addEventListener('click', () => deletePaymentMethod(userId, button.closest('li').dataset.id));
      });
    };
  
    const deleteTransaction = async (userId, transactionId) => {
      const transactionRef = firestore.collection('users').doc(userId).collection('Transactions').doc(transactionId);
      const transactionDoc = await transactionRef.get();
      const transaction = transactionDoc.data();
  
      if (transaction.paymentMethod === "accountbalance") {
        const userRef = firestore.collection('users').doc(userId);
        const userDoc = await userRef.get();
        let balance = userDoc.data().balance;
  
        if (transaction.type === "Sending to") {
          balance += transaction.amount;
        } else if (transaction.type === "Requesting from") {
          balance += transaction.amount;
        }
  
        await userRef.update({ balance });
      }
  
      await transactionRef.delete();
      alert('Transaction deleted');
      fetchTransactions(userId);
    };
  
    const deleteUser = async (userId) => {
      await firestore.collection('users').doc(userId).delete();
      alert('User deleted');
      renderDashboard();
    };
  
    const deletePaymentMethod = async (userId, paymentMethodId) => {
      const cardsRef = firestore.collection('users').doc(userId).collection('cards').doc(paymentMethodId);
      const bankAccountsRef = firestore.collection('users').doc(userId).collection('bankAccounts').doc(paymentMethodId);
  
      const cardDoc = await cardsRef.get();
      const bankAccountDoc = await bankAccountsRef.get();
  
      if (cardDoc.exists) {
        await cardsRef.delete();
      } else if (bankAccountDoc.exists) {
        await bankAccountsRef.delete();
      }
  
      alert('Payment method deleted');
      fetchPaymentMethods(userId);
    };
  
    auth.onAuthStateChanged((user) => {
      if (user) {
        firestore.collection('users').doc(user.uid).get()
          .then((doc) => {
            if (doc.exists && doc.data().admin) {
              renderDashboard();
            } else {
              auth.signOut();
              renderLogin();
            }
          })
          .catch(() => {
            auth.signOut();
            renderLogin();
          });
      } else {
        renderLogin();
      }
    });
  });
  