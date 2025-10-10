
# MintBank — E‑Banking Demo

> Front‑end e‑banking **demo** built with HTML/CSS/JS and Firebase (Auth + Firestore). 

**Live demo:** [https://morsliomar-cloud.github.io/MintBank/](https://morsliomar-cloud.github.io/MintBank/)  
**Repo:** [https://github.com/morsliomar-cloud/MintBank](https://github.com/morsliomar-cloud/MintBank)  
**Firebase Project ID:** `pfep-9ded1`  
**Hosting:** GitHub Pages

---

## Features

- Auth: Email/Password + Google (password reset + email verification enabled)
- Account overview (balance, recent transactions)
- Wallet: cards & external bank accounts
- P2P payments (send/request), transaction history
- Profile editing

---

## Tech Stack

- HTML, CSS, JavaScript
- Firebase Auth, Cloud Firestore, Storage
- Hosting: GitHub Pages

---

## App Map (pages)

```
index.html
Login.html
Signup.html
Account.html
Wallet.html
Send.html
Request.html
Activity.html
ProfileSettings.html
AddBank.html
AddCard.html  
Security.html
Help.html
Admin.html
```

---

## Firebase Config (client SDK)

```js
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBS-E-W1L3XK7stlVsS1c02FRzCBSA1zsE",
  authDomain: "pfep-9ded1.firebaseapp.com",
  projectId: "pfep-9ded1",
  storageBucket: "pfep-9ded1.appspot.com",
  messagingSenderId: "333176142301",
  appId: "1:333176142301:web:afced671374fc979e35e34"
};
```

---

## Data Model

### users/{uid}
```json
{
  "address": "",
  "balance": 18,
  "countryCode": "213",
  "countrySelect": "Algeria",
  "currency": "DZD",
  "email": "demo@example.com",
  "lastName": "bensaid",
  "name": "salah",
  "phoneNumber": "06******64",
  "profilePictureUrl": "./public/blankprofilepicture...png",
  "user": "Omar60",
  "username": "salah"
}
```

### users/{uid}/Transactions/{txId}
```json
{
  "amount": 10,
  "currency": "DZD",
  "date": "2024-06-06T09:10:13Z",
  "paymentMethod": "accountbalance",
  "receiver": "Mcid7GtiPmZCdBa6cygofWi6Kvf1",
  "sender": "dXVcEmp975VD2CrLfzsAjGh6oFe2",
  "type": "Sending to"
}
```

### users/{uid}/bankAccounts/{bankId} 
```json
{ "accountNumber": "123", "bankName": "Wells Fargo", "routingNumber": "201239" }
```

### users/{uid}/cards/{cardId}
```json
{ "cardNumber": "4200023445", "cardType": "visa", "cvv": "111", "expirationDate": "2023/16" }
```

### currensies/{id}
```json
{ "code": "ARS", "image": "public/icons8-argentina-96.png", "name": "Argentine Peso" }
```

## Firestore Rules (strict)

See [`FIRESTORE_RULES_STRICT.rules`](./FIRESTORE_RULES_STRICT.rules) for a complete policy that:

- restricts user docs to their owner,
- blocks fields like `cardNumber`, `cvv`, `accountNumber`, `routingNumber` from being written,
- makes `currencies` read‑only to everyone,
- prevents updates to past transactions (append‑only).

---

## Local Preview

```bash
# any static server works
python3 -m http.server 5173
# visit http://localhost:5173
```

## Credits & License

Academic demonstration only; do **not** use with real banking data.  
