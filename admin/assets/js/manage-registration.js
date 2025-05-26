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

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("sidebarBackdrop").classList.toggle("d-none");
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.clear();
    window.location.href = "../../../index.html";
  }
}

function loadStudentTable() {
  db.collection("registrations")
    .where("role", "==", "student")
    .where("status", "==", "Pending")
    .get()
    .then((querySnapshot) => {
      const students = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        students.push(data);
      });
      renderTable(students);
    })
    .catch((error) => {
      console.error("Error fetching student data:", error);
      document.getElementById("adminInfo").innerHTML =
        "<div class='alert alert-danger'>Error loading student data.</div>";
    });
}

function renderTable(dataArray) {
  const table = $("#studentTable");

  if ($.fn.DataTable.isDataTable(table)) {
    table.DataTable().clear().destroy();
  }

  let html = "";
  dataArray.forEach((data) => {
    html += `
      <tr>
        <td>${data.lrn}</td>
        <td>${data.firstname} ${data.middlename} ${data.lastname}</td>
        <td>${data.grade}</td>
        <td>${data.strand}</td>
        <td>${data.status}</td>
        <td>
          <button class="btn btn-sm btn-primary border-0 btn-sm edit-btn" data-id="${data.id}"><i class="bi bi-pencil-square"></i> Edit</button>
        </td>
      </tr>
    `;
  });

  table.find("tbody").html(html);

  table.DataTable({
    responsive: true,
    columnDefs: [{ targets: -1, orderable: false, searchable: false }],
  });
}

document.getElementById("editStrand").addEventListener("change", loadSections);
document.getElementById("editGrade").addEventListener("change", loadSections);

function loadSections() {
  const strand = document.getElementById("editStrand").value;
  const grade = document.getElementById("editGrade").value;
  const sectionSelect = document.getElementById("editSection");

  sectionSelect.innerHTML = `<option value="" disabled selected>Select Section</option>`;

  if (!strand || !grade) return Promise.resolve();

  return db.collection("subjects")
    .where("strand", "==", strand)
    .where("grade", "==", grade)
    .get()
    .then((querySnapshot) => {
      const sections = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.section) sections.add(data.section);
      });

      if (sections.size === 0) {
        sectionSelect.innerHTML = `<option value="" disabled selected>No sections found</option>`;
      } else {
        sections.forEach((section) => {
          const option = document.createElement("option");
          option.value = section;
          option.textContent = section;
          sectionSelect.appendChild(option);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching sections:", error);
    });
}

$(document).on("click", ".edit-btn", function () {
  const studentId = $(this).data("id");

  db.collection("registrations")
    .doc(studentId)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        alert("Student not found.");
        return;
      }

      const data = doc.data();

      document.getElementById("editStudentId").value = doc.id;
      document.getElementById("editLrn").value = data.lrn || "";
      document.getElementById("editFirstname").value = data.firstname || "";
      document.getElementById("editMiddlename").value = data.middlename || "";
      document.getElementById("editLastname").value = data.lastname || "";
      document.getElementById("editEmail").value = data.email || "";
      document.getElementById("editGender").value = data.gender || "";
      document.getElementById("editBirthday").value = data.birthday || "";
      document.getElementById("editContact").value = data.contact || "";
      document.getElementById("editGrade").value = data.grade || "";
      document.getElementById("editStrand").value = data.strand || "";

      // Auto-load sections based on grade and strand
      loadSections().then(() => {
        document.getElementById("editSection").value = data.section || "";
      });

      document.getElementById("editStatus").value = data.status || "";

      const editModal = new bootstrap.Modal(
        document.getElementById("editStudentModal")
      );
      editModal.show();
    })
    .catch((error) => {
      console.error("Error fetching student:", error);
      alert("Could not fetch student data.");
    });
});

document
  .getElementById("editStudentForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const closeBtn = document.getElementById("closeModal");
    const spinner = document.getElementById("loadingSpinner");

    submitBtn.disabled = true;
    closeBtn.disabled = true;
    spinner.classList.remove("d-none");

    const id = document.getElementById("editStudentId").value;
    const updatedData = {
      lrn: document.getElementById("editLrn").value.trim(),
      firstname: document.getElementById("editFirstname").value.trim(),
      middlename: document.getElementById("editMiddlename").value.trim(),
      lastname: document.getElementById("editLastname").value.trim(),
      gender: document.getElementById("editGender").value,
      birthday: document.getElementById("editBirthday").value,
      contact: document.getElementById("editContact").value.trim(),
      grade: document.getElementById("editGrade").value,
      strand: document.getElementById("editStrand").value,
      section: document.getElementById("editSection").value.trim(),
      status: "Enrolled",
    };

    db.collection("registrations")
      .doc(id)
      .update(updatedData)
      .then(() => {
        alert("Student has been enrolled successfully.");

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editStudentModal")
        );
        modal.hide();

        loadStudentTable();
      })
      .catch((error) => {
        console.error("Enrollment error:", error);
        alert("Failed to enroll student.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        closeBtn.disabled = false;
        spinner.classList.add("d-none");
      });
  });

loadStudentTable();

