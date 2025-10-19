import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAqg7YHkaFG-R7I9TxlBC9DFaIcIwnMTjY",
  authDomain: "chat-base-53a2d.firebaseapp.com",
  projectId: "chat-base-53a2d",
  storageBucket: "chat-base-53a2d.firebasestorage.app",
  messagingSenderId: "318621522199",
  appId: "1:318621522199:web:ef9b98a61b5e80767b7f52",
  measurementId: "G-4Z5FYM43TF",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
