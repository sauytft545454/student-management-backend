const BASE_URL = "http://localhost:3000";

/* ================= ADD STUDENT ================= */
async function addStudent() {
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const department_id = document.getElementById('dept').value;

  if (!name || !age || !department_id) {
    alert("All fields are required!");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, age, department_id })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('message').innerText = "✅ Student Added!";
      clearInputs();
      getStudents();
    } else {
      alert(data.message || "Error adding student");
    }

  } catch (err) {
    console.error(err);
    alert("Server not running!");
  }
}

/* ================= GET STUDENTS (TABLE) ================= */
async function getStudents() {
  try {
    const res = await fetch(`${BASE_URL}/students`);
    const data = await res.json();

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = "";

    data.forEach(student => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.name}</td>
        <td>${student.age}</td>
        <td>${student.department_id}</td>
        <td>
          <button class="edit-btn" onclick="updateStudent(${student.student_id}, '${student.name}', ${student.age})">Edit</button>
          <button class="delete-btn" onclick="deleteStudent(${student.student_id})">Delete</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    alert("Error loading students");
  }
}

/* ================= DELETE ================= */
async function deleteStudent(id) {
  if (!confirm("Are you sure?")) return;

  try {
    await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });

    getStudents();

  } catch (err) {
    console.error(err);
  }
}

/* ================= UPDATE ================= */
async function updateStudent(id, name, age) {
  const newName = prompt("Enter new name:", name);
  const newAge = prompt("Enter new age:", age);

  if (!newName || !newAge) return;

  try {
    await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: newName,
        age: newAge
      })
    });

    getStudents();

  } catch (err) {
    console.error(err);
  }
}

/* ================= CLEAR INPUT ================= */
function clearInputs() {
  document.getElementById('name').value = "";
  document.getElementById('age').value = "";
  document.getElementById('dept').value = "";
}

/* ================= AUTO LOAD ================= */
window.onload = getStudents;