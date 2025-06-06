
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from 'firebase/firestore'; // Corrected import

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log the configuration to the server console for debugging
console.log("Firebase Config Values from process.env:");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Loaded" : "MISSING or UNDEFINED");
console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Loaded" : "MISSING or UNDEFINED");

// Check if all essential config values are present before initializing
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  console.error(
    "Critical Firebase configuration is missing (apiKey, authDomain, or projectId). Please ensure your .env file is correctly set up with NEXT_PUBLIC_ prefixed variables and you have restarted the Next.js server."
  );
  // Throw an error to prevent the application from trying to initialize Firebase with incomplete config
  throw new Error("Firebase configuration is incomplete. Check server logs.");
}

let app: FirebaseApp;

if (!getApps().length) {
  try {
    console.log("Initializing new Firebase app with config:", firebaseConfig);
    app = initializeApp(firebaseConfig);
    console.log(`Firebase app "[${app.name}]" initialized successfully.`);
  } catch (initError: any) {
    console.error("Firebase initialization error:", initError);
    // Rethrow to ensure this critical failure is not silently ignored
    throw new Error(`Firebase initialization failed: ${initError.message || initError}`);
  }
} else {
  app = getApp();
  console.log(`Firebase app "[${app.name}]" already initialized. Using existing app.`);
}

let auth: Auth;
let db: Firestore;

try {
  auth = getAuth(app);
  console.log("Firebase Auth initialized successfully.");
} catch (authError: any) {
  console.error("Error initializing Firebase Auth:", authError);
  throw new Error(`Failed to initialize Firebase Auth: ${authError.message || authError}`);
}

try {
  db = getFirestore(app);
  console.log("Firestore initialized successfully.");
} catch (firestoreError: any) {
  console.error("Error initializing Firestore:", firestoreError);
  throw new Error(`Failed to initialize Firestore: ${firestoreError.message || firestoreError}`);
}

export { app, auth, db };
