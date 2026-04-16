const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
app.use(cors());

app.use(express.json());

/* ================== GET ALL STUDENTS ================== */
app.get('/students', (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(result);
    });
});
app.get('/students/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        "SELECT * FROM students WHERE student_id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.json(result[0]);
        }
    );
});
app.get('/student-details', (req, res) => {
    db.query(
        `SELECT 
            s.student_id,
            s.name,
            s.age,
            d.department_name
         FROM students s
         JOIN departments d 
         ON s.department_id = d.department_id`,
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(result);
        }
    );
});
app.get('/full-details', (req, res) => {
    db.query(
        `SELECT 
            s.student_id,
            s.name AS student_name,
            c.course_name,
            m.marks,
            a.attendance_percentage
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        JOIN courses c ON e.course_id = c.course_id
        LEFT JOIN marks m ON s.student_id = m.student_id AND c.course_id = m.course_id
        LEFT JOIN attendance a ON s.student_id = a.student_id AND c.course_id = a.course_id`,
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(result);
        }
    );
});


/* ================== ADD STUDENT ================== */
app.post('/students', (req, res) => {
    console.log("BODY:", req.body);

    const { name, age, department_id } = req.body;

    // Strong validation
    if (!name || !age || !department_id) {
        return res.status(400).json({
            message: "name, age and department_id are required"
        });
    }

    db.query(
        "INSERT INTO students (name, age, department_id) VALUES (?, ?, ?)",
        [name, age, department_id],
        (err, result) => {
            if (err) {
                console.error(err);

                // MySQL specific errors handled
                if (err.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        message: "Invalid department_id (foreign key error)"
                    });
                }

                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: "Student added successfully",
                student_id: result.insertId
            });
        }
    );
});

/* ================== UPDATE STUDENT ================== */
app.patch('/students/:id', (req, res) => {
    const id = req.params.id;
    const { name, age } = req.body;

    if (!name || !age) {
        return res.status(400).json({
            message: "name and age are required"
        });
    }

    db.query(
        "UPDATE students SET name = ?, age = ? WHERE student_id = ?",
        [name, age, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json({
                message: "Student updated successfully"
            });
        }
    );
});

/* ================== DELETE STUDENT ================== */
app.delete('/students/:id', (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM students WHERE student_id = ?",
        [id],
        (err, result) => {
            if (err) {
                console.error(err);

                if (err.code === "ER_ROW_IS_REFERENCED_2") {
                    return res.status(400).json({
                        message: "Cannot delete, student is linked to other data"
                    });
                }

                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.status(200).json({
                message: "Student deleted successfully"
            });
        }
    );
});


/* ================== SERVER ================== */
app.listen(3000, () => {
    console.log("Server running on port 3000 🚀");
});