
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log the configuration to the server console for debugging
console.log("Firebase Config Loaded by Next.js:");
console.log("API Key:", firebaseConfig.apiKey ? "Loaded" : "MISSING or UNDEFINED");
console.log("Auth Domain:", firebaseConfig.authDomain ? "Loaded" : "MISSING or UNDEFINED");
console.log("Project ID:", firebaseConfig.projectId ? "Loaded" : "MISSING or UNDEFINED");
// You can add more logs here for other config values if needed

let app: FirebaseApp;

// Check if all essential config values are present before initializing
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  console.error(
    "Firebase configuration is missing. Make sure your .env file is set up correctly and you have restarted the Next.js server."
  );
  // To prevent the app from crashing further down the line with a less clear error,
  // we can throw an error here or handle it gracefully.
  // For now, we'll let it proceed so the original Firebase error still shows if this isn't the primary issue.
}

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
