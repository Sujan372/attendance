import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

function TeacherDashboard() {
    const navigate = useNavigate();

    // ========================================
    // DATA STATES
    // ========================================

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});

    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    // ========================================
    // MARK STATES
    // ========================================

    const [markData, setMarkData] = useState({
        studentId: "",
        subject: "",
        examType: "Midterm",
        marksObtained: "",
        totalMarks: 100,
        class: ""
    });

    const [markSaving, setMarkSaving] = useState(false);
    const [markMessage, setMarkMessage] = useState("");

    // ========================================
    // COMPLAINT STATES
    // ========================================

    const [complaintData, setComplaintData] = useState({
        studentId: "",
        title: "",
        description: ""
    });

    const [complaintSaving, setComplaintSaving] = useState(false);
    const [complaintMessage, setComplaintMessage] = useState("");

    // ========================================
    // USER
    // ========================================

    const token = localStorage.getItem("token");

    const storedUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const teacherName =
        storedUser?.name ||
        storedUser?.username ||
        "Teacher";

    // ========================================
    // LOAD DATA
    // ========================================

    useEffect(() => {
        fetchStudents();
        fetchComplaints();
    }, []);

    // ========================================
    // FETCH STUDENTS
    // ========================================

    const fetchStudents = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/students",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const studentList =
                response.data.students || response.data;

            // Only display students with valid Student IDs
            const studentsWithId = studentList.filter(
                (student) =>
                    student.studentId &&
                    String(student.studentId).trim() !== ""
            );

            setStudents(studentsWithId);

        } catch (error) {
            console.error(
                "Error fetching students:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setMessage(
                error.response?.data?.message ||
                "Failed to load students."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // FETCH COMPLAINTS
    // ========================================

    const fetchComplaints = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/complaints",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setComplaints(
                response.data.complaints || []
            );

        } catch (error) {
            console.error(
                "Fetch complaints error:",
                error
            );
        }
    };

    // ========================================
    // ATTENDANCE SELECTION
    // ========================================

    const handleAttendanceChange = (
        studentId,
        status
    ) => {
        setAttendance((previous) => ({
            ...previous,
            [studentId]: status
        }));
    };

    // ========================================
    // SAVE ATTENDANCE
    // ========================================

    const saveAttendance = async () => {
        setMessage("");

        if (!token) {
            localStorage.clear();
            navigate("/");
            return;
        }

        const unmarkedStudents = students.filter(
            (student) =>
                !attendance[student.studentId]
        );

        if (unmarkedStudents.length > 0) {
            setMessage(
                `Please mark attendance for all students. ${unmarkedStudents.length} student(s) remaining.`
            );
            return;
        }

        try {
            setSaving(true);

            const attendanceData = students.map(
                (student) => ({
                    studentId: student.studentId,
                    status:
                        attendance[student.studentId]
                })
            );

            const today = new Date()
                .toISOString()
                .split("T")[0];

            const response = await axios.post(
                "http://localhost:5000/api/attendance/bulk",
                {
                    date: today,
                    attendance: attendanceData
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setMessage(
                response.data.message ||
                "Attendance saved successfully!"
            );

        } catch (error) {
            console.error(
                "Save attendance error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to save attendance."
            );

        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // MARK INPUT
    // ========================================

    const handleMarkChange = (e) => {
        const { name, value } = e.target;

        setMarkData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ========================================
    // ASSIGN MARK
    // ========================================

    const assignMark = async (e) => {
        e.preventDefault();

        setMarkMessage("");

        if (!token) {
            localStorage.clear();
            navigate("/");
            return;
        }

        if (
            !markData.studentId ||
            !markData.subject ||
            !markData.examType ||
            markData.marksObtained === "" ||
            !markData.totalMarks ||
            !markData.class
        ) {
            setMarkMessage(
                "Please fill all fields."
            );
            return;
        }

        const obtained = Number(
            markData.marksObtained
        );

        const total = Number(
            markData.totalMarks
        );

        if (obtained < 0) {
            setMarkMessage(
                "Marks obtained cannot be negative."
            );
            return;
        }

        if (total <= 0) {
            setMarkMessage(
                "Total marks must be greater than zero."
            );
            return;
        }

        if (obtained > total) {
            setMarkMessage(
                "Marks obtained cannot be greater than total marks."
            );
            return;
        }

        try {
            setMarkSaving(true);

            const response = await axios.post(
                "http://localhost:5000/api/marks",
                {
                    studentId:
                        markData.studentId,
                    subject:
                        markData.subject,
                    examType:
                        markData.examType,
                    marksObtained:
                        obtained,
                    totalMarks:
                        total,
                    class:
                        markData.class
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setMarkMessage(
                response.data.message ||
                "Mark assigned successfully!"
            );

            setMarkData({
                studentId: "",
                subject: "",
                examType: "Midterm",
                marksObtained: "",
                totalMarks: 100,
                class: ""
            });

        } catch (error) {
            console.error(
                "Assign mark error:",
                error
            );

            setMarkMessage(
                error.response?.data?.message ||
                "Failed to assign mark."
            );

        } finally {
            setMarkSaving(false);
        }
    };

    // ========================================
    // COMPLAINT INPUT
    // ========================================

    const handleComplaintChange = (e) => {
        const { name, value } = e.target;

        setComplaintData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // ========================================
    // CREATE COMPLAINT
    // ========================================

    const createComplaint = async (e) => {
        e.preventDefault();

        setComplaintMessage("");

        if (!token) {
            localStorage.clear();
            navigate("/");
            return;
        }

        if (
            !complaintData.studentId ||
            !complaintData.title ||
            !complaintData.description
        ) {
            setComplaintMessage(
                "Please fill all complaint fields."
            );
            return;
        }

        try {
            setComplaintSaving(true);

            const response = await axios.post(
                "http://localhost:5000/api/complaints",
                {
                    studentId:
                        complaintData.studentId,
                    title:
                        complaintData.title,
                    description:
                        complaintData.description
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setComplaintMessage(
                response.data.message ||
                "Complaint created successfully!"
            );

            setComplaintData({
                studentId: "",
                title: "",
                description: ""
            });

            await fetchComplaints();

        } catch (error) {
            console.error(
                "Create complaint error:",
                error
            );

            setComplaintMessage(
                error.response?.data?.message ||
                "Failed to create complaint."
            );

        } finally {
            setComplaintSaving(false);
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
            <div className="teacher-layout">

                <main className="teacher-main">

                    <div className="teacher-content">

                        <div className="no-data">
                            Loading teacher dashboard...
                        </div>

                    </div>

                </main>

            </div>
        );
    }

    // ========================================
    // PAGE
    // ========================================

    return (
        <div className="teacher-layout">

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside className="teacher-sidebar">

                {/* BRAND */}

                <div className="teacher-brand">

                    <div className="teacher-brand-logo">

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

                {/* NAVIGATION */}

                <nav className="teacher-nav">

                    <div
                        className="teacher-nav-item active"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            })
                        }
                    >

                        <span>⌂</span>

                        Dashboard

                    </div>

                    <div
                        className="teacher-nav-item"
                        onClick={() =>
                            document
                                .getElementById("attendance-section")
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >

                        <span>◷</span>

                        Attendance

                    </div>

                    <div
                        className="teacher-nav-item"
                        onClick={() =>
                            document
                                .getElementById("marks-section")
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >

                        <span>▣</span>

                        Marks

                    </div>

                    <div
                        className="teacher-nav-item"
                        onClick={() =>
                            document
                                .getElementById("complaints-section")
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >

                        <span>⚑</span>

                        Complaints

                    </div>

                    {/* NOTICES */}

                    <div
                        className="teacher-nav-item"
                        onClick={() => navigate("/teacher/notices")}
                    >

                        <span>✉</span>

                        Notices

                    </div>

                </nav>

                {/* SIDEBAR BOTTOM */}

                <div className="teacher-sidebar-bottom">

                    <div className="teacher-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Teacher
                        </strong>

                    </div>

                    <button
                        className="teacher-logout"
                        onClick={logout}
                    >

                        ↪ &nbsp; Logout

                    </button>

                </div>

            </aside>

            {/* ========================================
                MAIN
            ======================================== */}

            <main className="teacher-main">

                {/* TOPBAR */}

                <header className="teacher-topbar">

                    <div>

                        <p className="teacher-topbar-label">
                            TEACHER PORTAL
                        </p>

                        <h2>
                            Dashboard
                        </h2>

                    </div>

                    <div className="teacher-profile">

                        <div className="teacher-profile-text">

                            <strong>
                                {teacherName}
                            </strong>

                            <span>
                                Teacher
                            </span>

                        </div>

                        <div className="teacher-avatar">

                            {teacherName
                                ?.charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                {/* CONTENT */}

                <div className="teacher-content">

                    {/* ========================================
                        WELCOME
                    ======================================== */}

                    <section className="teacher-welcome">

                        <small>
                            PRIYADHARSHINIE PUBLIC SCHOOL
                        </small>

                        <h1>
                            Welcome, {teacherName}
                        </h1>

                        <p>
                            Manage attendance, academic
                            performance and student complaints
                            from one place.
                        </p>

                        <div className="teacher-welcome-line"></div>

                        <div className="teacher-circle one"></div>
                        <div className="teacher-circle two"></div>

                    </section>

                    {/* ========================================
                        ATTENDANCE
                    ======================================== */}

                    <section
                        id="attendance-section"
                        className="teacher-section"
                    >

                        <div className="teacher-section-header">

                            <div>

                                <span className="teacher-section-label">
                                    DAILY ATTENDANCE
                                </span>

                                <h2>
                                    Mark Attendance
                                </h2>

                            </div>

                            <div className="teacher-date">
                                {new Date().toLocaleDateString(
                                    "en-IN"
                                )}
                            </div>

                        </div>

                        {message && (
                            <div className="teacher-message">
                                {message}
                            </div>
                        )}

                        {students.length === 0 ? (

                            <div className="no-data">
                                No students found.
                            </div>

                        ) : (

                            <div className="teacher-table-wrapper">

                                <table className="teacher-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Student ID
                                            </th>

                                            <th>
                                                Student Name
                                            </th>

                                            <th>
                                                Class
                                            </th>

                                            <th>
                                                Attendance
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {students.map(
                                            (student) => {

                                                const currentStatus =
                                                    attendance[
                                                        student.studentId
                                                    ];

                                                return (

                                                    <tr
                                                        key={
                                                            student._id
                                                        }
                                                    >

                                                        <td className="student-id">
                                                            {
                                                                student.studentId
                                                            }
                                                        </td>

                                                        <td className="student-name">
                                                            {
                                                                student.name
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                student.standard
                                                            }
                                                        </td>

                                                        <td>

                                                            <div className="attendance-actions">

                                                                <button
                                                                    className={
                                                                        currentStatus ===
                                                                        "present"
                                                                            ? "present-btn selected"
                                                                            : "present-btn"
                                                                    }
                                                                    onClick={() =>
                                                                        handleAttendanceChange(
                                                                            student.studentId,
                                                                            "present"
                                                                        )
                                                                    }
                                                                >
                                                                    Present
                                                                </button>

                                                                <button
                                                                    className={
                                                                        currentStatus ===
                                                                        "absent"
                                                                            ? "absent-btn selected"
                                                                            : "absent-btn"
                                                                    }
                                                                    onClick={() =>
                                                                        handleAttendanceChange(
                                                                            student.studentId,
                                                                            "absent"
                                                                        )
                                                                    }
                                                                >
                                                                    Absent
                                                                </button>

                                                                <span className="selected-status">

                                                                    {currentStatus
                                                                        ? currentStatus
                                                                        : "Not marked"}

                                                                </span>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                        {students.length > 0 && (

                            <div
                                className="teacher-form-footer"
                                style={{
                                    marginTop: "20px"
                                }}
                            >

                                <button
                                    className="teacher-primary-btn"
                                    onClick={saveAttendance}
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving Attendance..."
                                        : "SAVE ATTENDANCE"}
                                </button>

                            </div>

                        )}

                    </section>

                    {/* ========================================
                        MARKS
                    ======================================== */}

                    <section
                        id="marks-section"
                        className="teacher-section"
                    >

                        <div className="teacher-section-header">

                            <div>

                                <span className="teacher-section-label">
                                    ACADEMICS
                                </span>

                                <h2>
                                    Assign Marks
                                </h2>

                            </div>

                        </div>

                        {markMessage && (
                            <div className="teacher-message">
                                {markMessage}
                            </div>
                        )}

                        <form onSubmit={assignMark}>

                            <div className="teacher-form-grid">

                                {/* STUDENT */}

                                <div className="teacher-form-group">

                                    <label>
                                        Student
                                    </label>

                                    <select
                                        name="studentId"
                                        value={
                                            markData.studentId
                                        }
                                        onChange={
                                            handleMarkChange
                                        }
                                    >

                                        <option value="">
                                            Select Student
                                        </option>

                                        {students.map(
                                            (student) => (
                                                <option
                                                    key={
                                                        student._id
                                                    }
                                                    value={
                                                        student.studentId
                                                    }
                                                >
                                                    {
                                                        student.studentId
                                                    }
                                                    {" - "}
                                                    {
                                                        student.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* SUBJECT */}

                                <div className="teacher-form-group">

                                    <label>
                                        Subject
                                    </label>

                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="Mathematics"
                                        value={
                                            markData.subject
                                        }
                                        onChange={
                                            handleMarkChange
                                        }
                                    />

                                </div>

                                {/* EXAM */}

                                <div className="teacher-form-group">

                                    <label>
                                        Exam Type
                                    </label>

                                    <select
                                        name="examType"
                                        value={
                                            markData.examType
                                        }
                                        onChange={
                                            handleMarkChange
                                        }
                                    >

                                        <option value="Midterm">
                                            Midterm
                                        </option>

                                        <option value="Final">
                                            Final
                                        </option>

                                        <option value="Quiz">
                                            Quiz
                                        </option>

                                        <option value="Assignment">
                                            Assignment
                                        </option>

                                        <option value="Practical">
                                            Practical
                                        </option>

                                    </select>

                                </div>

                                {/* MARKS */}

                                <div className="teacher-form-group">

                                    <label>
                                        Marks Obtained
                                    </label>

                                    <input
                                        type="number"
                                        name="marksObtained"
                                        placeholder="85"
                                        min="0"
                                        value={
                                            markData.marksObtained
                                        }
                                        onChange={
                                            handleMarkChange
                                        }
                                    />

                                </div>

                                {/* TOTAL */}

                                <div className="teacher-form-group">

                                    <label>
                                        Total Marks
                                    </label>

                                    <input
                                        type="number"
                                        name="totalMarks"
                                        min="1"
                                        value={
                                            markData.totalMarks
                                        }
                                        onChange={
                                            handleMarkChange
                                        }
                                    />

                                </div>

                                {/* CLASS */}

                                <div className="teacher-form-group">

                                    <label>
                                        Class
                                    </label>

                                    <input
                                        type="text"
                                        name="class"
                                        placeholder="10"
                                        value={
                                            markData.class
                                        }
                                        onChange={
                                            handleMarkChange
                                        }
                                    />

                                </div>

                            </div>

                            <div className="teacher-form-footer">

                                <button
                                    className="teacher-primary-btn"
                                    type="submit"
                                    disabled={markSaving}
                                >
                                    {markSaving
                                        ? "Assigning Mark..."
                                        : "ASSIGN MARK"}
                                </button>

                            </div>

                        </form>

                    </section>

                    {/* ========================================
                        COMPLAINTS
                    ======================================== */}

                    <section
                        id="complaints-section"
                        className="teacher-section"
                    >

                        <div className="teacher-section-header">

                            <div>

                                <span className="teacher-section-label">
                                    STUDENT SUPPORT
                                </span>

                                <h2>
                                    Complaint Management
                                </h2>

                            </div>

                        </div>

                        {complaintMessage && (
                            <div className="teacher-message">
                                {complaintMessage}
                            </div>
                        )}

                        {/* CREATE COMPLAINT */}

                        <form onSubmit={createComplaint}>

                            <div className="teacher-form-grid">

                                <div className="teacher-form-group">

                                    <label>
                                        Student
                                    </label>

                                    <select
                                        name="studentId"
                                        value={
                                            complaintData.studentId
                                        }
                                        onChange={
                                            handleComplaintChange
                                        }
                                    >

                                        <option value="">
                                            Select Student
                                        </option>

                                        {students.map(
                                            (student) => (
                                                <option
                                                    key={
                                                        student._id
                                                    }
                                                    value={
                                                        student.studentId
                                                    }
                                                >
                                                    {
                                                        student.studentId
                                                    }
                                                    {" - "}
                                                    {
                                                        student.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="teacher-form-group">

                                    <label>
                                        Complaint Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Homework Issue"
                                        value={
                                            complaintData.title
                                        }
                                        onChange={
                                            handleComplaintChange
                                        }
                                    />

                                </div>

                                <div className="teacher-form-group full">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        placeholder="Describe the issue..."
                                        value={
                                            complaintData.description
                                        }
                                        onChange={
                                            handleComplaintChange
                                        }
                                    ></textarea>

                                </div>

                            </div>

                            <div className="teacher-form-footer">

                                <button
                                    className="teacher-primary-btn"
                                    type="submit"
                                    disabled={complaintSaving}
                                >
                                    {complaintSaving
                                        ? "Submitting..."
                                        : "SUBMIT COMPLAINT"}
                                </button>

                            </div>

                        </form>

                        {/* EXISTING COMPLAINTS */}

                        <div
                            style={{
                                marginTop: "30px"
                            }}
                        >

                            <div className="teacher-section-header">

                                <div>

                                    <span className="teacher-section-label">
                                        RECORDS
                                    </span>

                                    <h2>
                                        Existing Complaints
                                    </h2>

                                </div>

                            </div>

                            {complaints.length === 0 ? (

                                <div className="no-data">
                                    No complaints found.
                                </div>

                            ) : (

                                <div className="complaint-list">

                                    {complaints.map(
                                        (complaint) => (

                                            <div
                                                className="complaint-card"
                                                key={
                                                    complaint._id
                                                }
                                            >

                                                <div className="complaint-main">

                                                    <span className="complaint-student">
                                                        {complaint.student?.studentId ||
                                                            "Unknown Student"}
                                                    </span>

                                                    <h3>
                                                        {
                                                            complaint.title
                                                        }
                                                    </h3>

                                                    <p>
                                                        {
                                                            complaint.description
                                                        }
                                                    </p>

                                                </div>

                                                <span className="complaint-status">
                                                    {
                                                        complaint.status
                                                    }
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}

export default TeacherDashboard;