// Entrada para empaquetar el SDK de Firebase en js/vendor/firebase.js (solo lo que usa js/nube.js).
// Para regenerarlo (desde una carpeta aparte, no dentro del repo):
//   npm i firebase@12.19.0 esbuild
//   npx esbuild firebase-entrada.js --bundle --format=esm --minify --legal-comments=none --outfile=<repo>/js/vendor/firebase.js
// Siempre con una versión exacta de firebase, nunca "latest".
export { initializeApp } from "firebase/app";
export { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signInWithCredential, linkWithPopup, reauthenticateWithPopup, deleteUser, onAuthStateChanged, signOut, connectAuthEmulator } from "firebase/auth";
export { initializeFirestore, persistentLocalCache, persistentSingleTabManager, connectFirestoreEmulator, terminate, clearIndexedDbPersistence, doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, runTransaction, writeBatch, serverTimestamp, arrayUnion, arrayRemove, increment } from "firebase/firestore";
