---
---
import {
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { ALLOWLIST } from "./allowlist.js?v={{ site.time | date: '%s' }}";

// Public by design — Firebase web config isn't a secret; anyone can read it
// in the page source, same as the ALLOWLIST below. Neither grants access on
// its own: only the real owner of a listed Google account can authenticate
// as that email. See CLAUDE.md, "Login con Google (Firebase Auth)".
const firebaseConfig = {
  apiKey: "AIzaSyClEqxFYyTlxFz96VPt-tx61Nwd50jpaCE",
  authDomain: "isabella-72273.firebaseapp.com",
  projectId: "isabella-72273",
  storageBucket: "isabella-72273.firebasestorage.app",
  messagingSenderId: "577833140676",
  appId: "1:577833140676:web:bddc67575be08160486491",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const authGate = document.getElementById("auth-gate");
const authGateMessage = document.getElementById("auth-gate-message");
const loginBtn = document.getElementById("auth-login-btn");
const mainContent = document.getElementById("main-content");

function showLoggedOut() {
  mainContent.hidden = true;
  authGate.hidden = false;
  authGateMessage.textContent = "¡Las noticias son sólo para mi familia!";
  loginBtn.hidden = false;
}

function showPending(email) {
  mainContent.hidden = true;
  authGate.hidden = false;
  authGateMessage.textContent =
    "Isabella seguramente te conoce, pero no estás en la lista blanca (" + email + "). Pedile acceso a su papá o mamá y volvé a intentar.";
  loginBtn.hidden = true;
}

function showAuthorized() {
  authGate.hidden = true;
  mainContent.hidden = false;
}

function isAllowed(email) {
  return ALLOWLIST.includes(email.toLowerCase());
}

loginBtn.addEventListener("click", function () {
  signInWithPopup(auth, provider).catch(function (err) {
    console.error("Error al iniciar sesión:", err);
    authGateMessage.textContent = "No se pudo iniciar sesión. Probá de nuevo.";
  });
});

onAuthStateChanged(auth, function (user) {
  if (!user) {
    showLoggedOut();
    return;
  }
  if (isAllowed(user.email)) {
    showAuthorized();
  } else {
    showPending(user.email);
  }
});
