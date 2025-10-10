
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
- Profile editing (+ optional avatar in Storage)

---

## Tech Stack

- HTML, CSS, JavaScript
- Firebase Auth, Cloud Firestore, (optional) Storage
- Hosting: GitHub Pages
- Optional CI: GitHub Actions for Pages deploys

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
AddCrad.html   # consider renaming to AddCard.html
Security.html
Help.html
Admin.html
```

> Tip: fix small typos (`AddCrad.html` → `AddCard.html`). Avoid duplicate filenames (you listed `Account.html` twice and `Acout.html`).

---

## Firebase Config (client SDK)

> This snippet is **not a secret**; it identifies your project in the client app.
```js
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBS-E-W1L3XK7stlVsS1c02FRzCBSA1zsE",
  authDomain: "pfep-9ded1.firebaseapp.com",
  projectId: "pfep-9ded1",
  storageBucket: "pfep-9ded1.appspot.com",
  messagingSenderId: "333176142301",
  appId: "1:333176142301:web:afced671374fc979e35e34",
  measurementId: "G-B66YVGKEVX"
};
```

---

## Data Model (Current vs Recommended)

### users/{uid} (current example fields you shared)
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

### users/{uid}/bankAccounts/{bankId} (current)
```json
{ "accountNumber": "123", "bankName": "Wells Fargo", "routingNumber": "201239" }
```

### users/{uid}/cards/{cardId} (current)
```json
{ "cardNumber": "4200023445", "cardType": "visa", "cvv": "111", "expirationDate": "2023/16" }
```

### currensies/{id} (current)
```json
{ "code": "ARS", "image": "public/icons8-argentina-96.png", "name": "Argentine Peso" }
```
> Suggest rename collection to `currencies` and key docs by `code` (e.g., `currencies/ARS`).

#### ✅ Recommended (safe) shapes
- **cards**: `{ "cardType": "visa", "last4": "3445", "expMonth": 12, "expYear": 2027, "createdAt": 1717430400 }`  
- **bankAccounts**: `{ "bankName": "Wells Fargo", "accountNumberSuffix": "0123" }`  
- **transactions**: (as above; avoid PII in notes)  
- **users**: avoid real emails/phones in public demos; mask or use test accounts

---

## Firestore Rules (strict)

See [`FIRESTORE_RULES_STRICT.rules`](./FIRESTORE_RULES_STRICT.rules) for a complete policy that:

- restricts user docs to their owner,
- blocks fields like `cardNumber`, `cvv`, `accountNumber`, `routingNumber` from being written,
- makes `currencies` read‑only to everyone,
- prevents updates to past transactions (append‑only).

> Deploy them with the commands in **Security First**.

---

## Migration (one‑time cleanup script)

Use this Node script (firebase‑admin) to convert existing **cards** / **bankAccounts** to safe shapes and remove sensitive fields. Save as `scripts/migrate-safe-data.js`:

```js
/**
 * npm i firebase-admin
 * node scripts/migrate-safe-data.js
 * Make sure you set GOOGLE_APPLICATION_CREDENTIALS to a service account key locally.
 * Do NOT commit the key to Git.
 */
const admin = require('firebase-admin');

admin.initializeApp(); // uses GOOGLE_APPLICATION_CREDENTIALS

const db = admin.firestore();

function parseExpiry(exp) {
  // Accepts "MM/YY", "MM/YYYY", or "YYYY/MM"
  if (!exp) return { expMonth: null, expYear: null };
  const t = exp.replace(/\s+/g, '');
  let m=null, y=null;
  if (/^\d{2}\/\d{2}$/.test(t)) { m=+t.slice(0,2); y=2000+ +t.slice(3,5); }
  else if (/^\d{2}\/\d{4}$/.test(t)) { m=+t.slice(0,2); y=+t.slice(3,7); }
  else if (/^\d{4}\/\d{2}$/.test(t)) { y=+t.slice(0,4); m=+t.slice(5,7); }
  return { expMonth:m, expYear:y };
}

(async () => {
  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;

    // cards
    const cardsSnap = await db.collection('users').doc(uid).collection('cards').get();
    for (const c of cardsSnap.docs) {
      const d = c.data();
      const last4 = (d.cardNumber || '').slice(-4);
      const { expMonth, expYear } = parseExpiry(d.expirationDate);
      const safe = {
        cardType: d.cardType || 'unknown',
        last4: last4 || null,
        expMonth: expMonth || null,
        expYear: expYear || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await c.ref.set(safe, { merge: true });
      await c.ref.update({ cardNumber: admin.firestore.FieldValue.delete(), cvv: admin.firestore.FieldValue.delete(), expirationDate: admin.firestore.FieldValue.delete() });
      console.log('Sanitized card', uid, c.id);
    }

    // bank accounts
    const banksSnap = await db.collection('users').doc(uid).collection('bankAccounts').get();
    for (const b of banksSnap.docs) {
      const d = b.data();
      const suffix = (d.accountNumber || '').slice(-4);
      const safe = {
        bankName: d.bankName || 'Bank',
        accountNumberSuffix: suffix || null
      };
      await b.ref.set(safe, { merge: true });
      await b.ref.update({ accountNumber: admin.firestore.FieldValue.delete(), routingNumber: admin.firestore.FieldValue.delete() });
      console.log('Sanitized bank account', uid, b.id);
    }
  }
  console.log('Migration complete.');
})().catch(e => (console.error(e), process.exit(1)));
```

> After running, confirm that **no** cardNumber/cvv/routingNumber/accountNumber fields remain. Then enable the **strict rules**.

---

## Local Preview

```bash
# any static server works
python3 -m http.server 5173
# visit http://localhost:5173
```

---

## Deployment (GitHub Pages)

You’re already on Pages. If needed, add: `.github/workflows/gh-pages.yml` (provided earlier). Every push to `main` will deploy, and the site is at:
- https://morsliomar-cloud.github.io/MintBank/

---

## Credits & License

Academic demonstration only; do **not** use with real banking data.  
License: MIT (add LICENSE file if you want it visible in the repo header).
