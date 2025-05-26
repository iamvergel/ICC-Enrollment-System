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

document.getElementById("admin-email").textContent = email || "Admin";

db.collection("registrations")
  .where("status", "==", "Enrolled")
  .get()
  .then((querySnapshot) => {
    const groups = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const key = `${data.strand}-${data.grade}-${data.section}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push({ id: doc.id, ...data });
    });

    const container = document.getElementById("enrolledCards");
    container.innerHTML = "";

    Object.keys(groups).forEach((key, index) => {
      const [strand, grade, section] = key.split("-");
      const cardHTML = `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-semibold text-primary">${strand}</span>
          <span class="badge bg-secondary">Grade ${grade}</span>
        </div>
        <div class="card-body d-flex justify-content-between align-items-center">
          <p class="mb-0 fw-medium"><small>Section:</small> ${section}</p>
          <button class="btn btn-sm btn-outline-primary" onclick="showStudents('${strand}', '${grade}', '${section}')">
            Show Students
          </button>
        </div>
      </div>
    </div>
  `;
      container.innerHTML += cardHTML;
    });

    window.enrolledGroups = groups;
  })
  .catch((error) => {
    console.error("Error fetching enrolled data:", error);
  });

let dataTableInstance;

function showStudents(strand, grade, section) {
  const key = `${strand}-${grade}-${section}`;
  const students = window.enrolledGroups[key] || [];

  const modalTitle = document.getElementById("studentsModalLabel");
  modalTitle.textContent = `${strand} | Grade ${grade} | Section ${section}`;

  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = students
    .map(
      (student) => `
    <tr>
      <td>${student.firstname} ${student.middlename} ${student.lastname}</td>
      <td>${student.email}</td>
      <td>${student.strand}</td>
      <td>${student.grade}</td>
      <td>${student.section}</td>
    </tr>
  `
    )
    .join("");

  // Reinitialize DataTable every time
  if (dataTableInstance) {
    dataTableInstance.destroy();
  }
  dataTableInstance = $("#studentsTable").DataTable({
    responsive: true,
    autoWidth: false,
  });

  const modal = new bootstrap.Modal(document.getElementById("studentsModal"));
  modal.show();
}

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
