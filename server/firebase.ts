import admin from 'firebase-admin';

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Validate that all required config values are present
    if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
      console.warn('[Firebase] Missing required configuration. Firebase will not be available.');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          privateKey: firebaseConfig.privateKey,
          clientEmail: firebaseConfig.clientEmail,
        }),
      });
      console.log('[Firebase] Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase Admin:', error);
  }
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export default admin;
