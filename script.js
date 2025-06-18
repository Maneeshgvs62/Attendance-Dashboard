const form = document.getElementById("studentForm");
const tableBody = document.getElementById("dataTable");
const chartCanvas = document.getElementById("studentChart");
const searchBar = document.getElementById("searchBar");
const themeToggle = document.getElementById("themeToggle");
const tableContainer = document.getElementById("tableContainer");
const chartWarning = document.getElementById("chartWarning");

let studentData = JSON.parse(localStorage.getItem("studentData")) || [];
let chart;

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  document.body.classList.toggle("light-theme");
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const marks = parseFloat(document.getElementById("marks").value);
  const attendance = parseFloat(document.getElementById("attendance").value);

  if (name && !isNaN(marks) && !isNaN(attendance)) {
    if (marks < 0 || marks > 100 || attendance < 0 || attendance > 100) {
      alert("Enter values between 0 and 100.");
      return;
    }

    studentData.push({ name, marks, attendance });
    saveData();
    render();
    form.reset();
  }
});

function saveData() {
  localStorage.setItem("studentData", JSON.stringify(studentData));
}

function render(filter = "") {
  tableBody.innerHTML = "";
  const filtered = studentData.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.marks}</td>
      <td>${student.attendance}</td>
      <td>
        <button class="btn btn-warning btn-sm me-2" onclick="editStudent(${index})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStudent(${index})">Delete</button>
      </td>`;
    tableBody.appendChild(row);
  });

  updateChart(filtered);
}

function updateChart(data) {
  const names = data.map(s => s.name);
  const marks = data.map(s => s.marks);
  const attendance = data.map(s => s.attendance);

  const markColors = marks.map(m => m < 50 ? "#dc3545" : "#007bff");
  const attendanceColors = attendance.map(a => a < 75 ? "#fd7e14" : "#ffc107");

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: names,
      datasets: [
        {
          label: "Marks (%)",
          data: marks,
          backgroundColor: markColors
        },
        {
          label: "Attendance (%)",
          data: attendance,
          backgroundColor: attendanceColors
        },
        {
          label: "Pass Mark (50%)",
          type: "line",
          data: new Array(data.length).fill(50),
          borderColor: "red",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        },
        {
          label: "Min Attendance (75%)",
          type: "line",
          data: new Array(data.length).fill(75),
          borderColor: "green",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

  const warning = data.some(s => s.marks < 50 || s.attendance < 75);
  chartWarning.innerHTML = warning
    ? "⚠️ Some students are below required thresholds."
    : "";
}

function editStudent(index) {
  const student = studentData[index];
  const newName = prompt("Edit Name:", student.name);
  const newMarks = prompt("Edit Marks:", student.marks);
  const newAttendance = prompt("Edit Attendance:", student.attendance);

  if (newName && !isNaN(newMarks) && !isNaN(newAttendance)) {
    studentData[index] = {
      name: newName,
      marks: parseFloat(newMarks),
      attendance: parseFloat(newAttendance)
    };
    saveData();
    render(searchBar.value);
  }
}

function deleteStudent(index) {
  if (confirm("Delete this student?")) {
    studentData.splice(index, 1);
    saveData();
    render(searchBar.value);
  }
}

function exportCSV() {
  let csv = "\uFEFFName,Marks (%),Attendance (%)\r\n";
  studentData.forEach((s) => {
    csv += `"${s.name}","${s.marks}","${s.attendance}"\r\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student_data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportExcel() {
  const worksheet = XLSX.utils.json_to_sheet(studentData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "student_data.xlsx");
}

function exportPDF() {
  const cloneTable = tableContainer.cloneNode(true);
  cloneTable.querySelectorAll("tr").forEach(row => {
    const lastCell = row.lastElementChild;
    if (lastCell && row.children.length === 4) lastCell.remove();
  });

  const opt = {
    margin: 0.5,
    filename: "student_data.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(cloneTable).save();
}

searchBar.addEventListener("input", () => {
  render(searchBar.value);
});

render();
