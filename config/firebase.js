// import admin from "firebase-admin";
// import serviceAccount from "../serviceAccountKey.json";

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export default admin;

// services/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Decode Base64 from environment variable
const decodedKey = Buffer.from(
  process.env.FB_SERVICE_ACCOUNT_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decodedKey);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
