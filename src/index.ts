import { onAuthUserCreate } from 'firebase-functions/v2/auth';
import * as functions from 'firebase-functions';


// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
// export const addmessage = onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the given message into Firestore using the Firebase Admin SDK.
//   const writeResult = await admin.firestore().collection('messages').add({original: original});
//   // Send back a message that we've successfully written the message
//   res.json({result: `Message with ID: ${writeResult.id} added.`});
// });


export const createUserDoc = onAuthUserCreate(async (event: functions.auth.UserRecord) => {
  const user = event; // The Firebase user.

  const userRef = admin.firestore().collection('users').doc(user.uid);
  await userRef.set({
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // Add any other initial fields you need for a user
  });
});

// Listens for new messages added to /messages/:documentId/original
// and creates an uppercase version of the message
// exports.makeUppercase = onDocumentCreated('/messages/{documentId}', (event) => {
//   // Grab the current value of what was written to Firestore.
//   const original = event.data.data().original;

//   // Access the parent document
//   const messageRef = event.data.ref;

//   // Access the documentId from the path
//   const documentId = event.params.documentId;

//   // Convert the message to uppercase
//   const uppercase = original.toUpperCase();

//   // You must return a Promise when performing asynchronous tasks inside a Functions such as
//   // writing to Firestore.
//   // Setting an 'uppercase' field in Firestore document
//   return messageRef.set({uppercase}, {merge: true});
// });

// Add the setOrganizationClaims function
exports.setOrganizationClaims = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated and has the necessary permissions
    if (!context.auth || context.auth.token.organization) {
        throw new functions.https.HttpsError('permission-denied', 'User is not authorized to set organization claims.');
    }

    const userId = data.userId;
    const organizationId = data.organizationId;

    if (!userId || !organizationId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with arguments "userId" and "organizationId".');
    }

    try {
        // Set a custom claim on the user
        await admin.auth().setCustomUserClaims(userId, { organization: organizationId });

        return { message: `Custom claim 'organization: ${organizationId}' set for user ${userId}.` };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Unable to set custom claim.', error);
    }
});