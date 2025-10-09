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

async function loadCurrencies() {
  try {
    const querySnapshot = await db.collection('currencies').get();
    let currencies = [];
    querySnapshot.forEach((doc) => {
      currencies.push(doc.data());
    });
    console.log("Currencies loaded: ", currencies); // Debug log
    return currencies;
  } catch (error) {
    console.error("Error loading currencies: ", error);
  }
}

function updateCurrencyUI(currency, container) {
  if (!currency) {
    console.error("Currency is undefined");
    return;
  }

  const image = container.querySelector('.image-icon2') || container.querySelector('.image-icon3');
  const code = container.querySelector('.text84') || container.querySelector('.text86');
  const name = container.querySelector('.text85') || container.querySelector('.text87');

  if (image && code && name) {
    image.src = currency.image;
    code.textContent = currency.code;
    name.textContent = currency.name;
  } else {
    console.error("Container elements not found");
  }
}

function populateCurrencyDropdowns(currencies) {
  const select1 = document.getElementById('currency-select-1');
  const select2 = document.getElementById('currency-select-2');

  if (!select1 || !select2) {
    console.error("Currency select elements not found");
    return;
  }

  currencies.forEach(currency => {
    const option1 = document.createElement('option');
    option1.value = currency.code;
    option1.textContent = currency.name;
    select1.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = currency.code;
    option2.textContent = currency.name;
    select2.appendChild(option2);
  });

  // Initialize select lists with different currencies
  if (currencies.length >= 2) {
    select1.selectedIndex = 0;
    select2.selectedIndex = 1;

    const selectedCurrency1 = currencies[0];
    const selectedCurrency2 = currencies[1];

    updateCurrencyUI(selectedCurrency1, document.querySelector('.container70'));
    updateCurrencyUI(selectedCurrency2, document.querySelector('.container71'));
  }

  select1.addEventListener('change', (e) => {
    handleSelectChange(select1, select2, currencies);
  });

  select2.addEventListener('change', (e) => {
    handleSelectChange(select2, select1, currencies);
  });
}

function handleSelectChange(changedSelect, otherSelect, currencies) {
  if (changedSelect.value === otherSelect.value) {
    const nextIndex = (changedSelect.selectedIndex + 1) % currencies.length;
    changedSelect.selectedIndex = nextIndex;
  }

  const selectedCurrency1 = currencies.find(c => c.code === document.getElementById('currency-select-1').value);
  const selectedCurrency2 = currencies.find(c => c.code === document.getElementById('currency-select-2').value);

  updateCurrencyUI(selectedCurrency1, document.querySelector('.container70'));
  updateCurrencyUI(selectedCurrency2, document.querySelector('.container71'));
}

async function getExchangeRate(fromCurrency, toCurrency) {
  const apiKey = 'fca_live_8FhQGwSAAr6kfQ3LOQ7WoC1QnZArj8nCBkKNd2dy';
  const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${toCurrency}&base_currency=${fromCurrency}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.data && data.data[toCurrency]) {
      return data.data[toCurrency];
    } else {
      throw new Error('Failed to fetch exchange rate');
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    alert('Error fetching exchange rate');
  }
}

function performConversion() {
  const select1 = document.getElementById('currency-select-1');
  const select2 = document.getElementById('currency-select-2');
  const input = document.getElementById('input').value;
  const result = document.getElementById('result');

  const fromCurrency = select2.value; // Convert from currency selected in currency-select-2
  const toCurrency = select1.value; // Convert to currency selected in currency-select-1
  const amount = parseFloat(input);

  if (isNaN(amount)) {
    alert('Please enter a valid number');
    return;
  }

  getExchangeRate(fromCurrency, toCurrency).then(rate => {
    if (rate) {
      const convertedAmount = (amount * rate).toFixed(2);
      result.textContent = convertedAmount;
    } else {
      result.textContent = 'Conversion rate not available';
    }
  }).catch(error => {
    console.error('Error fetching exchange rate:', error);
    alert('Error fetching exchange rate');
  });
}

document.getElementById('go').addEventListener('click', performConversion);

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

loadCurrencies().then(currencies => {
  if (!currencies || currencies.length === 0) {
    console.error("No currencies loaded");
    return;
  }

  populateCurrencyDropdowns(currencies);
});
