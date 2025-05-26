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

const role = sessionStorage.getItem("role");
const email = sessionStorage.getItem("email");

if (!role || role !== "admin") {
  window.location.href = "../../../index.html";
}

// document.getElementById("adminEmail").textContent = email;
document.getElementById("admin-email").textContent = email || "Admin";

db.collection("registrations")
  .where("email", "==", email)
  .get()
  .then((querySnapshot) => {
    if (querySnapshot.empty) {
      document.getElementById("adminInfo").innerHTML =
        "<div class='alert alert-danger'>Admin data not found.</div>";
    } else {
      const data = querySnapshot.docs[0].data();
      document.getElementById("adminName").textContent =
        data.firstname + " " + data.middlename + " " + data.lastname || "Admin";

      

      let html = "<ul class='list-group'>";
      for (let key in data) {
        html += `<li class='list-group-item'><strong>${key}:</strong> ${data[key]}</li>`;
      }
      html += "</ul>";
      document.getElementById("adminInfo").innerHTML = html;
    }
  })
  .catch((error) => {
    console.error("Error fetching admin data:", error);
    document.getElementById("adminInfo").innerHTML =
      "<div class='alert alert-danger'>Error loading admin data.</div>";
  });

function logout() {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    sessionStorage.clear();
    window.location.href = "../../../index.html";
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const content = document.getElementById("content");

  sidebar.classList.toggle("active");
  sidebarBackdrop.classList.toggle("d-none");
}

const currentPath = window.location.pathname;
if (currentPath.includes("dashboard")) {
  document.getElementById("dashboardLink").classList.add("active");
} else if (currentPath.includes("student")) {
  document.getElementById("studentLink").classList.add("active");
} else if (currentPath.includes("registration")) {
  document.getElementById("registrationLink").classList.add("active");
} else if (currentPath.includes("subject")) {
  document.getElementById("subjectLink").classList.add("active");
}
