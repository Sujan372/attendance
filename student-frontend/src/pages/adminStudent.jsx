import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminStudent.css";

function AdminStudents() {
    const navigate = useNavigate();

    // ========================================
    // STUDENT STATES
    // ========================================

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    // ========================================
    // FORM STATES
    // ========================================

    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        studentId: "",
        name: "",
        standard: "",
        rollNumber: "",
        academicYear: "",
        guardianName: "",
        guardianPhone: ""
    });

    // ========================================
    // AUTH
    // ========================================

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const adminName =
        user?.name ||
        user?.username ||
        "Administrator";

    // ========================================
    // LOAD STUDENTS
    // ========================================

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/students",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStudents(
                response.data.students || []
            );

        } catch (err) {
            console.error(
                "Fetch students error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load students."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // SEARCH
    // ========================================

    const filteredStudents = students.filter(
        (student) => {

            const query =
                search.trim().toLowerCase();

            if (!query) {
                return true;
            }

            return (
                student.studentId
                    ?.toLowerCase()
                    .includes(query) ||

                student.name
                    ?.toLowerCase()
                    .includes(query) ||

                student.standard
                    ?.toLowerCase()
                    .includes(query) ||

                student.guardianName
                    ?.toLowerCase()
                    .includes(query)
            );
        }
    );

    // ========================================
    // FORM CHANGE
    // ========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ========================================
    // RESET FORM
    // ========================================

    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            studentId: "",
            name: "",
            standard: "",
            rollNumber: "",
            academicYear: "",
            guardianName: "",
            guardianPhone: ""
        });
    };

    // ========================================
    // OPEN ADD FORM
    // ========================================

    const openAddForm = () => {
        setEditingStudent(null);
        resetForm();

        setMessage("");
        setError("");
        setShowForm(true);
    };

    // ========================================
    // OPEN EDIT FORM
    // ========================================

    const openEditForm = (student) => {
        setEditingStudent(student);

        setFormData({
            username:
                student.user?.username || "",
            password: "",
            studentId:
                student.studentId || "",
            name:
                student.name || "",
            standard:
                student.standard || "",
            rollNumber:
                student.rollNumber || "",
            academicYear:
                student.academicYear || "",
            guardianName:
                student.guardianName || "",
            guardianPhone:
                student.guardianPhone || ""
        });

        setMessage("");
        setError("");
        setShowForm(true);
    };

    // ========================================
    // CLOSE FORM
    // ========================================

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingStudent(null);
        resetForm();
    };

    // ========================================
    // SAVE STUDENT
    // ========================================

    const saveStudent = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            localStorage.clear();
            navigate("/");
            return;
        }

        // ========================================
        // CREATE VALIDATION
        // ========================================

        if (!editingStudent) {

            if (
                !formData.username ||
                !formData.password
            ) {
                setError(
                    "Username and password are required."
                );
                return;
            }
        }

        // ========================================
        // COMMON VALIDATION
        // ========================================

        if (
            !formData.studentId ||
            !formData.name ||
            !formData.standard ||
            !formData.rollNumber ||
            !formData.academicYear ||
            !formData.guardianName ||
            !formData.guardianPhone
        ) {
            setError(
                "Please fill all required student fields."
            );
            return;
        }

        if (Number(formData.rollNumber) <= 0) {
            setError(
                "Roll number must be greater than zero."
            );
            return;
        }

        try {
            setSaving(true);

            // ========================================
            // EDIT STUDENT
            // ========================================

            if (editingStudent) {

                const response =
                    await axios.put(
                        `http://localhost:5000/api/students/${editingStudent.studentId}`,
                        {
                            name:
                                formData.name.trim(),

                            standard:
                                formData.standard.trim(),

                            rollNumber:
                                Number(
                                    formData.rollNumber
                                ),

                            academicYear:
                                formData.academicYear.trim(),

                            guardianName:
                                formData.guardianName.trim(),

                            guardianPhone:
                                formData.guardianPhone.trim()
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                setMessage(
                    response.data.message ||
                    "Student updated successfully."
                );

            } else {

                // ========================================
                // CREATE STUDENT + USER
                // ========================================

                const response =
                    await axios.post(
                        "http://localhost:5000/api/students",
                        {
                            username:
                                formData.username.trim(),

                            password:
                                formData.password,

                            studentId:
                                formData.studentId.trim(),

                            name:
                                formData.name.trim(),

                            standard:
                                formData.standard.trim(),

                            rollNumber:
                                Number(
                                    formData.rollNumber
                                ),

                            academicYear:
                                formData.academicYear.trim(),

                            guardianName:
                                formData.guardianName.trim(),

                            guardianPhone:
                                formData.guardianPhone.trim()
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                setMessage(
                    response.data.message ||
                    "Student account and profile created successfully."
                );
            }

            setShowForm(false);
            setEditingStudent(null);
            resetForm();

            await fetchStudents();

        } catch (err) {
            console.error(
                "Save student error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to save student."
            );

        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // DELETE STUDENT
    // ========================================

    const deleteStudent = async (student) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${student.name} (${student.studentId})? This will also delete the linked student login account.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response =
                await axios.delete(
                    `http://localhost:5000/api/students/${student.studentId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setMessage(
                response.data.message ||
                "Student deleted successfully."
            );

            await fetchStudents();

        } catch (err) {
            console.error(
                "Delete student error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to delete student."
            );
        }
    };

    // ========================================
    // LOGOUT
    // ========================================

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="admin-students-layout">

                <main className="admin-students-main">

                    <div className="admin-students-loading">

                        <div className="admin-students-loader"></div>

                        <p>
                            Loading students...
                        </p>

                    </div>

                </main>

            </div>
        );
    }

    // ========================================
    // PAGE
    // ========================================

    return (
        <div className="admin-students-layout">

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside className="admin-students-sidebar">

                <div className="admin-students-brand">

                    <div className="admin-students-logo">

                        <img
                            src="/school_logo.jpeg"
                            alt="Priyadharshinie Public School"
                        />

                    </div>

                    <div>

                        <h2>
                            Priyadharshinie
                        </h2>

                        <span>
                            Public School
                        </span>

                    </div>

                </div>

                <nav className="admin-students-nav">

                    <div
                        className="admin-students-nav-item"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </div>

                    <div
                        className="admin-students-nav-item active"
                    >
                        <span>👤</span>
                        Students
                    </div>

                    <div
                        className="admin-students-nav-item"
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        <span>◉</span>
                        Teachers
                    </div>

                    <div
                        className="admin-students-nav-item"
                        onClick={() =>
                            navigate("/admin/attendance")
                        }
                    >
                        <span>◷</span>
                        Attendance
                    </div>

                    <div
                        className="admin-students-nav-item"
                        onClick={() =>
                            navigate("/admin/marks")
                        }
                    >
                        <span>▣</span>
                        Marks
                    </div>

                    <div
                        className="admin-students-nav-item"
                        onClick={() =>
                            navigate("/admin/complaints")
                        }
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                </nav>

                <div className="admin-students-sidebar-bottom">

                    <div className="admin-students-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                    <button
                        className="admin-students-logout"
                        onClick={logout}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* ========================================
                MAIN
            ======================================== */}

            <main className="admin-students-main">

                {/* TOPBAR */}

                <header className="admin-students-topbar">

                    <div>

                        <p>
                            ADMIN PORTAL
                        </p>

                        <h2>
                            Students
                        </h2>

                    </div>

                    <div className="admin-students-profile">

                        <div className="admin-students-profile-text">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <div className="admin-students-avatar">
                            {adminName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                    </div>

                </header>

                {/* CONTENT */}

                <div className="admin-students-content">

                    {/* PAGE HEADING */}

                    <section className="admin-students-heading">

                        <div>

                            <span>
                                STUDENT MANAGEMENT
                            </span>

                            <h1>
                                Student Records
                            </h1>

                            <p>
                                Manage student information
                                and guardian details.
                            </p>

                        </div>

                        <button
                            className="admin-students-add-btn"
                            onClick={openAddForm}
                        >
                            + Add Student
                        </button>

                    </section>

                    {/* MESSAGES */}

                    {message && (
                        <div className="admin-students-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="admin-students-error">
                            {error}
                        </div>
                    )}

                    {/* SEARCH */}

                    <section className="admin-students-toolbar">

                        <div className="admin-students-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search by student ID, name, class..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="admin-students-count">
                            {filteredStudents.length} Students
                        </div>

                    </section>

                    {/* TABLE */}

                    <section className="admin-students-card">

                        <div className="admin-students-table-wrapper">

                            <table className="admin-students-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Class
                                        </th>

                                        <th>
                                            Roll No.
                                        </th>

                                        <th>
                                            Academic Year
                                        </th>

                                        <th>
                                            Guardian
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredStudents.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="admin-students-empty"
                                            >
                                                No students found.
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredStudents.map(
                                            (student) => (

                                                <tr
                                                    key={
                                                        student._id
                                                    }
                                                >

                                                    <td>

                                                        <div className="admin-student-name">

                                                            <div className="admin-student-avatar">
                                                                {student.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        student.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        student.studentId
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {
                                                            student.standard
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            student.rollNumber
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            student.academicYear
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            student.guardianName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            student.guardianPhone
                                                        }
                                                    </td>

                                                    <td>

                                                        <div className="admin-student-actions">

                                                            <button
                                                                type="button"
                                                                className="admin-edit-btn"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        student
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="admin-delete-btn"
                                                                onClick={() =>
                                                                    deleteStudent(
                                                                        student
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>

                </div>

            </main>

            {/* ========================================
                ADD / EDIT MODAL
            ======================================== */}

            {showForm && (

                <div className="admin-student-modal-overlay">

                    <div className="admin-student-modal">

                        <div className="admin-student-modal-header">

                            <div>

                                <span>
                                    {editingStudent
                                        ? "EDIT RECORD"
                                        : "NEW RECORD"}
                                </span>

                                <h2>
                                    {editingStudent
                                        ? "Edit Student"
                                        : "Add Student"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-student-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={saveStudent}
                            className="admin-student-form"
                        >

                            {/* ========================================
                                LOGIN INFORMATION
                            ======================================== */}

                            {!editingStudent && (
                                <>
                                    <div className="admin-form-field">

                                        <label>
                                            Username
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="student26x03"
                                            value={
                                                formData.username
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                    <div className="admin-form-field">

                                        <label>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Create password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>
                                </>
                            )}

                            {/* ========================================
                                STUDENT ID
                            ======================================== */}

                            <div className="admin-form-field">

                                <label>
                                    Student ID
                                </label>

                                <input
                                    type="text"
                                    name="studentId"
                                    placeholder="26X01"
                                    value={
                                        formData.studentId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        Boolean(editingStudent)
                                    }
                                    required
                                />

                            </div>

                            {/* NAME */}

                            <div className="admin-form-field">

                                <label>
                                    Student Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Student name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* CLASS */}

                            <div className="admin-form-field">

                                <label>
                                    Class
                                </label>

                                <input
                                    type="text"
                                    name="standard"
                                    placeholder="10"
                                    value={
                                        formData.standard
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* ROLL NUMBER */}

                            <div className="admin-form-field">

                                <label>
                                    Roll Number
                                </label>

                                <input
                                    type="number"
                                    name="rollNumber"
                                    min="1"
                                    placeholder="1"
                                    value={
                                        formData.rollNumber
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* ACADEMIC YEAR */}

                            <div className="admin-form-field">

                                <label>
                                    Academic Year
                                </label>

                                <input
                                    type="text"
                                    name="academicYear"
                                    placeholder="2026-27"
                                    value={
                                        formData.academicYear
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* GUARDIAN NAME */}

                            <div className="admin-form-field">

                                <label>
                                    Guardian Name
                                </label>

                                <input
                                    type="text"
                                    name="guardianName"
                                    placeholder="Parent / Guardian name"
                                    value={
                                        formData.guardianName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* GUARDIAN PHONE */}

                            <div className="admin-form-field">

                                <label>
                                    Guardian Phone
                                </label>

                                <input
                                    type="tel"
                                    name="guardianPhone"
                                    placeholder="Phone number"
                                    value={
                                        formData.guardianPhone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* ========================================
                                EDIT INFORMATION
                            ======================================== */}

                            {editingStudent && (
                                <div className="admin-form-field admin-form-full">

                                    <small>
                                        Username:
                                        {" "}
                                        {editingStudent.user?.username ||
                                            "Not available"}
                                    </small>

                                </div>
                            )}

                            {/* FORM ACTIONS */}

                            <div className="admin-student-form-actions">

                                <button
                                    type="button"
                                    className="admin-cancel-btn"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingStudent
                                            ? "Update Student"
                                            : "Create Student"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminStudents;