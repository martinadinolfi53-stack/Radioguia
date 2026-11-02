// Datos públicos del proyecto de Firebase "App RX" (no son secretos: identifican el proyecto; la seguridad está en las reglas de Firestore).
// Transcriptos de una captura de la consola: si el login falla con "API key not valid", revisar apiKey contra
// Configuración del proyecto > General > Tus apps.
// authDomain: el ingreso con Google pasa por la página /__/auth/handler de ese dominio. Si es el mismo sitio donde corre la app
// (Firebase Hosting: app-rx-188a6.web.app), el iPhone con la app instalada puede terminar el ingreso; desde otro sitio
// (el viejo de GitHub Pages) se usa el de siempre, firebaseapp.com.
const enFirebaseHosting = typeof location !== "undefined" && /^app-rx-188a6\.(web\.app|firebaseapp\.com)$/.test(location.hostname);
export const firebaseConfig = {
  apiKey: "AIzaSyCxgklNg-0oTn3zcXZgOy-QxgvcLievZRE",
  authDomain: enFirebaseHosting ? location.hostname : "app-rx-188a6.firebaseapp.com",
  projectId: "app-rx-188a6",
  storageBucket: "app-rx-188a6.firebasestorage.app",
  messagingSenderId: "1021511412577",
  appId: "1:1021511412577:web:12106e9ebe4cd2ab913320",
};

// App Check: clave del sitio de reCAPTCHA v3 (pública, como las de arriba; la clave secreta queda solo en la consola de Firebase).
// Vacía = App Check apagado. Con clave, cada pedido a Firebase lleva una prueba de que viene de esta app y no de un script ajeno.
// Mientras en la consola esté en "sin aplicar" solo se mide; recién al tocar "Aplicar" se rechaza lo que no la traiga.
export const appCheckClave = "";
