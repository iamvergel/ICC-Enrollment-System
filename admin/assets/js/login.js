const role = sessionStorage.getItem("role");
if (role === "student") window.location.href = "../student/index.html";
else if (role === "admin")
  window.location.href = "../../admin/pages/dashboard/index.html";

const firebaseConfig = {
  apiKey: "AIzaSyAi3Fda-gSp_5uTIAsJMPmMPwBvySAdk",
  authDomain: "enrollment-system-fc73c.firebaseapp.com",
  projectId: "enrollment-system-fc73c",
  storageBucket: "enrollment-system-fc73c.appspot.com",
  messagingSenderId: "433321641506",
  appId: "1:433321641506:web:b7e82815f6f90b3762ac7b",
  measurementId: "G-ZZY2VT9VP3",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
togglePassword.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.querySelector("i").classList.toggle("bi-eye");
  togglePassword.querySelector("i").classList.toggle("bi-eye-slash");
});

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("password").value;
  const alertBox = document.getElementById("loginAlert");
  const loginBtn = this.querySelector('button[type="submit"]');
  const spinner = document.getElementById("loadingSpinner");

  alertBox.classList.add("d-none");
  alertBox.classList.remove("alert-danger", "alert-success");

  spinner.classList.remove("d-none");
  loginBtn.disabled = true;

  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
    showAlert("Please use a valid Gmail address.", "danger");
    resetButton();
    return;
  }

  db.collection("registrations")
    .where("email", "==", email)
    .where("password", "==", password)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        showAlert("Username or password is incorrect.", "danger");
        resetButton();
      } else {
        const userData = querySnapshot.docs[0].data();
        const role = userData.role || "student";

        window.sessionStorage.setItem("role", role);
        window.sessionStorage.setItem("email", userData.email);

        showAlert(`Login successful as ${role}. Redirecting...`, "success");

        setTimeout(() => {
          window.location.href =
            role === "admin"
              ? "../../admin/pages/dashboard/index.html"
              : "../student/index.html";
        }, 1500);
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      showAlert("An error occurred. Please try again.", "danger");
      resetButton();
    });

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
    alertBox.classList.add("alert-" + type);
  }

  function resetButton() {
    spinner.classList.add("d-none");
    loginBtn.disabled = false;
  }
});
