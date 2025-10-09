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
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let isProfilePictureRemoved = false; // Flag to check if profile picture was removed

function maskEmail(email) {
    const [localPart, domain] = email.split('@');
    if (localPart.length > 3) {
        const maskedLocalPart = localPart[0] + 'xxxxxx' + localPart.slice(-2);
        return `${maskedLocalPart}@${domain}`;
    } else {
        const maskedLocalPart = localPart[0] + 'xxxxxx';
        return `${maskedLocalPart}@${domain}`;
    }
}

function unmaskEmail(maskedEmail) {
    const user = auth.currentUser;
    if (user) {
        return user.email;
    }
    return maskedEmail;
}

auth.onAuthStateChanged(user => {
    if (user) {
        // Load user information from Firestore
        const docRef = db.collection("users").doc(user.uid);
        loadOldPfp(user.uid);
        docRef.get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('name').value = data.name || '';
                document.getElementById('lastname').value = data.lastName || '';
                document.getElementById('username').value = data.username || '';
                document.getElementById('email').value = maskEmail(user.email) || '';
                document.getElementById('address').value = data.address || '';
                document.getElementById('phone').value = data.phoneNumber || '';
                document.getElementById('countrycode').value = data.countryCode || '';
                document.getElementById('USERNAME').innerHTML = data.username || '';
            }
        }).catch(error => {
            console.error('Error getting document:', error);
        });
    } else {
        // Redirect to login page if not logged in
        window.location.href = "login.html";
    }
});

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        const name = document.getElementById('name').value;
        const lastName = document.getElementById('lastname').value;
        const username = document.getElementById('username').value;
        const maskedEmail = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const phoneNumber = document.getElementById('phone').value;
        const countryCode = document.getElementById('countrycode').value;
        const password = document.getElementById('password').value;

        try {
            const docRef = db.collection("users").doc(user.uid);
            const profileData = {
                name,
                lastName,
                username,
                address,
                phoneNumber,
                countryCode
            };

            // Update profile picture URL if removed
            if (isProfilePictureRemoved) {
                profileData.profilePictureUrl = "./public/blankprofilepicture973460-1280-cropped-11@2x.png";
            }

            await docRef.set(profileData, { merge: true });

            if (password) {
                await user.updatePassword(password);
            }

            const email = unmaskEmail(maskedEmail);

            if (email !== user.email) {
                await user.verifyBeforeUpdateEmail(email);
                alert("A verification email has been sent to your new email address. Please verify it and log in again to update your profile.");
                await auth.signOut();
                window.location.href = "login.html";
                return;
            }

            alert("Profile updated successfully!");
        } catch (error) {
            if (error.code === "auth/requires-recent-login") {
                alert("Please reauthenticate to update your profile.");
                window.location.href = "login.html";
            } else {
                console.error("Error updating profile:", error);
                alert("Error updating profile: " + error.message);
            }
        }
    }
});

async function loadOldPfp(userId) {
    try {
        console.log("Loading old profile picture for user ID:", userId);
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            const userData = doc.data();
            const oldPfpUrl = userData.profilePictureUrl;
            if (oldPfpUrl) {
                document.getElementById('pfp').src = oldPfpUrl;
                console.log("Profile picture loaded successfully.");
            } else {
                console.log('No profile picture URL found in the document.');
            }
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error getting document:', error);
    }
}

function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('pfp').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

document.getElementById('avatarUpload').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        previewImage(this.files[0]);
        isProfilePictureRemoved = false; // Reset flag if a new image is selected
    }
});

async function uploadPfp() {
    const user = auth.currentUser;
    if (!user) {
        alert('You need to sign in first.');
        return;
    }

    const fileInput = document.getElementById('avatarUpload');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storageRef = storage.ref();
        const userPfpRef = storageRef.child(`profile_pictures/${user.uid}/${file.name}`);

        try {
            const snapshot = await userPfpRef.put(file);
            const newPfpUrl = await snapshot.ref.getDownloadURL();

            await db.collection('users').doc(user.uid).set({
                profilePictureUrl: newPfpUrl
            }, { merge: true });

            document.getElementById('pfp').src = newPfpUrl;

            alert('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Error uploading profile picture.');
        }
    } else {
        alert('Please select a file to upload.');
    }
}

function removePfp() {
    const defaultPfpUrl = "./public/blankprofilepicture973460-1280-cropped-11@2x.png";
    document.getElementById('pfp').src = defaultPfpUrl;
    isProfilePictureRemoved = true; // Set flag to indicate the profile picture was removed
}

document.getElementById('removepfp').addEventListener('click', removePfp);
