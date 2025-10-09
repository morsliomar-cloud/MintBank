// TODO: Replace with your Firebase config
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

auth.onAuthStateChanged((user) => {
    if (user) {
        const transactionsContainer = document.getElementById('user-data');
        const filterInput = document.getElementById('filterbyuser');

        db.collection("users").doc(user.uid).collection("Transactions")
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    transactionsContainer.innerHTML += '<div class="no-transactions-yet">No transactions yet.</div>';
                } else {
                    const transactions = [];
                    querySnapshot.forEach((doc) => {
                        transactions.push({ id: doc.id, data: doc.data() });
                    });

                    const fetchReceiverName = (transactionData) => {
                        return db.collection("users").doc(transactionData.receiver).get()
                            .then((receiverDoc) => {
                                const receiverData = receiverDoc.data();
                                return receiverData ? receiverData.name : 'Unknown';
                            });
                    };

                    const renderTransactions = (filteredTransactions) => {
                        const rowsHtml = filteredTransactions.map((transactionData) => {
                            const date = transactionData.data.date.toDate();
                            const formattedDate = date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });

                            return fetchReceiverName(transactionData.data).then((receiverName) => {
                                return `
                                    <div class="row" data-transaction-id="${transactionData.id}">
                                        <div class="cell"><div class="data1">${formattedDate}</div></div>
                                        <div class="cell1"><div class="data2">${transactionData.data.type}</div></div>
                                        <div class="cell2"><div class="data3">${receiverName}</div></div>
                                        <div class="cell4"><div class="data5">${transactionData.data.amount}</div></div>
                                        <div class="cell6"><div class="data7">Report</div></div>
                                    </div>
                                `;
                            });
                        });

                        Promise.all(rowsHtml).then((rowsHtml) => {
                            const rows = rowsHtml.join('');
                            transactionsContainer.querySelectorAll('.row[data-transaction-id]').forEach(row => row.remove());
                            transactionsContainer.innerHTML += rows;
                        });
                    };

                    renderTransactions(transactions);

                    filterInput.addEventListener('input', () => {
                        const filterValue = filterInput.value.toLowerCase();
                        const filteredTransactionsPromises = transactions.map((transaction) => {
                            return fetchReceiverName(transaction.data).then((receiverName) => {
                                if (receiverName.toLowerCase().includes(filterValue)) {
                                    return transaction;
                                }
                                return null;
                            });
                        });

                        Promise.all(filteredTransactionsPromises).then((filteredTransactions) => {
                            renderTransactions(filteredTransactions.filter(transaction => transaction !== null));
                        });
                    });
                }
            })
            .catch((error) => {
                console.log("Error getting transactions:", error);
            });
    } else {
        // Redirect to the Login.html page if the user is not logged in
        window.location.href = 'Login.html';
    }
});
