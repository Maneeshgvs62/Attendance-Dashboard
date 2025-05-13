const form = document.getElementById("studentForm");
const tableBody = document.getElementById("dataTable");
const chartCanvas = document.getElementById("studentChart");

let studentData = [];
let chart;

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const marks = parseFloat(document.getElementById("marks").value);
  const attendance = parseFloat(document.getElementById("attendance").value);

  if (name && !isNaN(marks) && !isNaN(attendance)) {
    studentData.push({ name, marks, attendance });
    updateTable();
    updateChart();
    form.reset();
  }
});

function updateTable() {
  tableBody.innerHTML = "";
  studentData.forEach((student, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.marks}%</td>
      <td>${student.attendance}%</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="editStudent(${index})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteStudent(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function updateChart() {
  const names = studentData.map((s) => s.name);
  const marks = studentData.map((s) => s.marks);
  const attendance = studentData.map((s) => s.attendance);

  if (chart) chart.destroy();
  chart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: names,
      datasets: [
        {
          label: "Marks (%)",
          data: marks,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: "Attendance (%)",
          data: attendance,
          backgroundColor: "rgba(255, 206, 86, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

function editStudent(index) {
  const student = studentData[index];
  const newName = prompt("Edit Name:", student.name);
  const newMarks = prompt("Edit Marks (%):", student.marks);
  const newAttendance = prompt("Edit Attendance (%):", student.attendance);

  if (newName && !isNaN(newMarks) && !isNaN(newAttendance)) {
    studentData[index] = {
      name: newName,
      marks: parseFloat(newMarks),
      attendance: parseFloat(newAttendance),
    };
    updateTable();
    updateChart();
  }
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this record?")) {
    studentData.splice(index, 1);
    updateTable();
    updateChart();
  }
}

function exportCSV() {
  let csv = "Name,Marks (%),Attendance (%)\r\n";
  studentData.forEach((s) => {
    const row = `"${s.name}","${s.marks}","${s.attendance}"\r\n`;
    csv += row;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "student_data.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

}
