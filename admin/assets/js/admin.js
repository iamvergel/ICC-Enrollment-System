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

document.getElementById("adminName").textContent = email;
document.getElementById("admin-email").textContent = email || "Admin";

const dashboardCards = document.getElementById("dashboardCards");

db.collection("registrations")
  .get()
  .then((querySnapshot) => {
    let totalStudents = 0;
    let grade11 = 0;
    let grade12 = 0;
    const strandCounts = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.role === "student") {
        totalStudents++;

        if (data.grade == "Grade 11") grade11++;
        else if (data.grade == "Grade 12") grade12++;

        if (data.strand) {
          if (!strandCounts[data.strand]) strandCounts[data.strand] = 0;
          strandCounts[data.strand]++;
        }
      }
    });

    let html = `
      <div class="col-md-4">
        <div class="card text-white bg-primary shadow">
          <div class="card-body">
            <h5 class="card-title">Total Students</h5>
            <p class="card-text fs-4">${totalStudents}</p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card text-white bg-success shadow">
          <div class="card-body">
            <h5 class="card-title">Grade 11</h5>
            <p class="card-text fs-4">${grade11}</p>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card text-white bg-info shadow">
          <div class="card-body">
            <h5 class="card-title">Grade 12</h5>
            <p class="card-text fs-4">${grade12}</p>
          </div>
        </div>
      </div>
    `;

    const colors = ["warning", "danger", "secondary", "dark"];
    let i = 0;

    for (const strand in strandCounts) {
      const color = colors[i % colors.length];
      html += `
        <div class="col-md-4">
          <div class="card text-white bg-${color} shadow">
            <div class="card-body">
              <h5 class="card-title">${strand}</h5>
              <p class="card-text fs-4">${strandCounts[strand]} students</p>
            </div>
          </div>
        </div>
      `;
      i++;
    }

    dashboardCards.innerHTML = html;
  })
  .catch((error) => {
    console.error("Error loading dashboard data:", error);
    dashboardCards.innerHTML = `<div class='alert alert-danger'>Unable to load dashboard statistics.</div>`;
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
