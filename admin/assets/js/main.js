const firebaseConfig = {
  apiKey: "AIzaSyAi3F3Jda-gSp_5uTIAsJMPmMPwBvySAdk",
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
const confirmPasswordInput = document.getElementById("confirmPassword");
const icon = togglePassword.querySelector("i");

togglePassword.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  icon.classList.toggle("bi-eye");
  icon.classList.toggle("bi-eye-slash");
});

const updatePasswordValidation = () => {
  if (passwordInput.value === confirmPasswordInput.value) {
    passwordInput.classList.add("border-success");
    passwordInput.classList.remove("border-danger");
    confirmPasswordInput.classList.add("border-success");
    confirmPasswordInput.classList.remove("border-danger");
  } else {
    passwordInput.classList.add("border-danger");
    passwordInput.classList.remove("border-success");
    confirmPasswordInput.classList.add("border-danger");
    confirmPasswordInput.classList.remove("border-success");
  }
};

passwordInput.addEventListener("input", updatePasswordValidation);
confirmPasswordInput.addEventListener("input", updatePasswordValidation);

const contactInput = document.getElementById("contact");

contactInput.addEventListener("input", () => {
  if (!contactInput.value.startsWith("+63")) {
    contactInput.value = "+63";
  }

  let digits = contactInput.value.slice(3).replace(/[^0-9]/g, "");
  digits = digits.slice(0, 13);
  contactInput.value = "+63" + digits;
});

contactInput.addEventListener("keydown", (e) => {
  if (
    (e.key === "Backspace" && contactInput.selectionStart <= 3) ||
    (e.key === "Delete" && contactInput.selectionStart < 3)
  ) {
    e.preventDefault();
  }
});

contactInput.addEventListener("click", () => {
  if (contactInput.selectionStart < 3) {
    contactInput.setSelectionRange(3, 3);
  }
});

contactInput.addEventListener("focus", () => {
  if (!contactInput.value) contactInput.value = "+63";
  if (contactInput.selectionStart < 3) {
    contactInput.setSelectionRange(3, 3);
  }
});

document
  .getElementById("registrationForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const loader = document.getElementById("loadingSpinner");
    const submitButton = document.getElementById("submitButton");

    // Show loader, hide submit button
    loader.classList.remove("d-none");
    submitButton.classList.add("d-none");

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const email = document.getElementById("email").value.trim();

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      alert("Please enter a valid Gmail address (e.g., yourname@gmail.com).");
      loader.classList.add("d-none");
      submitButton.classList.remove("d-none");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match.");
      loader.classList.add("d-none");
      submitButton.classList.remove("d-none");
      return;
    }

    const isPasswordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/.test(
        password
      );

    if (!isPasswordValid) {
      alert(
        "Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one special character."
      );
      loader.classList.add("d-none");
      submitButton.classList.remove("d-none");
      return;
    }

    const formData = {
      grade: document.getElementById("Grade").value,
      strand: document.getElementById("Strand").value,
      lrn: document.getElementById("lrn").value,
      firstname: document.getElementById("Firstname").value,
      lastname: document.getElementById("Lastname").value,
      middlename: document.getElementById("Middlename").value,
      birthday: document.getElementById("birthday").value,
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
      contact: document.getElementById("contact").value,
      section: "",
      status: "Pending",
      role: "student",
      email: email,
      password: password,
    };

    // Check if LRN exists
    db.collection("registrations")
      .where("lrn", "==", formData.lrn)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          alert("LRN already registered. Please try again.");
          loader.classList.add("d-none");
          submitButton.classList.remove("d-none");
          return;
        }

        // Check if Email exists
        db.collection("registrations")
          .where("email", "==", formData.email)
          .get()
          .then((querySnapshot) => {
            if (querySnapshot.size > 0) {
              alert("Email already registered. Please try again.");
              loader.classList.add("d-none");
              submitButton.classList.remove("d-none");
              return;
            }

            // Add registration data
            db.collection("registrations")
              .add(formData)
              .then(() => {
                alert("Registration successful!");
                window.location.href = "index.html";
              })
              .catch((error) => {
                console.error("Error saving registration: ", error);
                alert(
                  "There was an error during registration. Please try again."
                );
                loader.classList.add("d-none");
                submitButton.classList.remove("d-none");
              });
          })
          .catch((error) => {
            console.error("Error checking email: ", error);
            alert("There was an error during registration. Please try again.");
            loader.classList.add("d-none");
            submitButton.classList.remove("d-none");
          });
      })
      .catch((error) => {
        console.error("Error checking LRN: ", error);
        alert("There was an error during registration. Please try again.");
        loader.classList.add("d-none");
        submitButton.classList.remove("d-none");
      });
  });

document.getElementById("birthday").addEventListener("change", function () {
  const birthday = new Date(this.value);
  if (!isNaN(birthday)) {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthday.getDate())
    ) {
      age--;
    }
    if (age >= 14) {
      document.getElementById("age").value = age;
    } else {
      alert("Your age must be at least 14 years old to register.");
      document.getElementById("age").value = "";
      document.getElementById("birthday").value = "";
    }
  } else {
    document.getElementById("age").value = "";
  }
});
