import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentDashboard.css";

function StudentDashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);
    const [complaintsLoading, setComplaintsLoading] = useState(true);

    const [error, setError] = useState("");
    const [complaintError, setComplaintError] = useState("");

    // ========================================
    // GET TOKEN
    // ========================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // ========================================
    // LOAD DASHBOARD
    // ========================================

    useEffect(() => {
        const fetchDashboard = async () => {
            const token = getToken();

            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get(
                    "http://localhost:5000/api/students/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setDashboard(response.data);
                setError("");

            } catch (err) {
                console.error(
                    "Dashboard error:",
                    err
                );

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [navigate]);

    // ========================================
    // LOAD STUDENT COMPLAINTS
    // ========================================

    useEffect(() => {
        const fetchComplaints = async () => {
            const token = getToken();

            if (!token) {
                setComplaintsLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    "http://localhost:5000/api/complaints/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setComplaints(
                    response.data?.complaints || []
                );

                setComplaintError("");

            } catch (err) {
                console.error(
                    "Complaints error:",
                    err
                );

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                    return;
                }

                setComplaintError(
                    err.response?.data?.message ||
                    "Failed to load complaints"
                );

            } finally {
                setComplaintsLoading(false);
            }
        };

        fetchComplaints();
    }, [navigate]);

    // ========================================
    // LOGOUT
    // ========================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    // ========================================
    // GO TO COMPLAINTS
    // ========================================

    const goToComplaints = () => {
        const complaintSection =
            document.getElementById("complaints-section");

        if (complaintSection) {
            complaintSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="loading-screen">

                <div className="loader"></div>

                <p>
                    Loading your dashboard...
                </p>

            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error) {
        return (
            <div className="error-screen">

                <h2>
                    {error}
                </h2>

                <button
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Try Again
                </button>

            </div>
        );
    }

    // ========================================
    // SAFETY CHECK
    // ========================================

    if (!dashboard?.student) {
        return (
            <div className="error-screen">

                <h2>
                    Dashboard data unavailable
                </h2>

                <button
                    onClick={() =>
                        navigate("/")
                    }
                >
                    Back to Login
                </button>

            </div>
        );
    }

    // ========================================
    // SAFE DATA
    // ========================================

    const student = dashboard.student;

    const attendance =
        dashboard.attendance || {};

    const marks =
        dashboard.marks || {};

    const attendancePercentage =
        Number(attendance.percentage) || 0;

    const academicPercentage =
        Number(marks.percentage) || 0;

    const presentDays =
        attendance.presentDays || 0;

    const absentDays =
        attendance.absentDays || 0;

    const totalDays =
        attendance.totalDays || 0;

    const marksObtained =
        marks.marksObtained || 0;

    const totalMarks =
        marks.totalMarks || 0;

    const subjects =
        marks.subjects || 0;

    // ========================================
    // PAGE
    // ========================================

    return (
        <div className="dashboard-layout">

            {/* ================= SIDEBAR ================= */}

            <aside className="sidebar">

                {/* BRAND */}

                <div className="brand">

                    <div className="brand-logo">

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

                <nav className="sidebar-nav">

                    {/* DASHBOARD */}

                    <div
                        className="nav-item active"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </div>

                    {/* ATTENDANCE */}

                    <div
                        className="nav-item"
                        onClick={() =>
                            navigate("/attendance")
                        }
                    >
                        <span>◷</span>
                        Attendance
                    </div>

                    {/* ACADEMIC */}

                    <div
                        className="nav-item"
                        onClick={() =>
                            navigate("/academic")
                        }
                    >
                        <span>▣</span>
                        Academic
                    </div>

                    {/* NOTICES */}

                    <div
                        className="nav-item"
                        onClick={() =>
                            navigate("/notices")
                        }
                    >
                        <span>✉</span>
                        Notices
                    </div>

                    {/* COMPLAINTS */}

                    <div
                        className="nav-item"
                        onClick={goToComplaints}
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                </nav>

                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">

                    <div className="school-year">

                        <span>
                            Academic Year
                        </span>

                        <strong>
                            {student.academicYear ||
                                "2026-27"}
                        </strong>

                    </div>

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* ================= MAIN ================= */}

            <main className="main-content">

                {/* ================= TOP BAR ================= */}

                <header className="topbar">

                    <div>

                        <p className="topbar-label">
                            STUDENT PORTAL
                        </p>

                        <h2>
                            Dashboard
                        </h2>

                    </div>

                    <div className="profile">

                        <div className="profile-text">

                            <strong>
                                {student.name}
                            </strong>

                            <span>
                                Class {student.standard}
                            </span>

                        </div>

                        <div className="profile-avatar">

                            {student.name
                                ?.charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                {/* ================= CONTENT ================= */}

                <div className="dashboard-content">

                    {/* ================= WELCOME ================= */}

                    <section className="welcome-card">

                        <div className="welcome-content">

                            <span className="welcome-label">
                                WELCOME BACK
                            </span>

                            <h1>
                                Hello, {student.name}
                            </h1>

                            <p>
                                Here's a quick overview
                                of your academic
                                performance and
                                attendance.
                            </p>

                            <div className="student-meta">

                                <span>
                                    Student ID

                                    <strong>
                                        {student.studentId}
                                    </strong>
                                </span>

                                <span>
                                    Roll Number

                                    <strong>
                                        {student.rollNumber}
                                    </strong>
                                </span>

                            </div>

                        </div>

                        <div className="welcome-shape">

                            <div className="shape-circle circle-one"></div>

                            <div className="shape-circle circle-two"></div>

                        </div>

                    </section>

                    {/* ================= STAT CARDS ================= */}

                    <section className="stats-grid">

                        {/* ATTENDANCE */}

                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    Attendance
                                </span>

                                <div className="stat-icon">
                                    ◷
                                </div>

                            </div>

                            <h3>
                                {attendancePercentage}%
                            </h3>

                            <p>
                                {presentDays} days present
                            </p>

                        </div>

                        {/* ACADEMIC */}

                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    Academic Score
                                </span>

                                <div className="stat-icon">
                                    ★
                                </div>

                            </div>

                            <h3>
                                {academicPercentage}%
                            </h3>

                            <p>
                                Overall performance
                            </p>

                        </div>

                        {/* SUBJECTS */}

                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    Subjects
                                </span>

                                <div className="stat-icon">
                                    ▣
                                </div>

                            </div>

                            <h3>
                                {subjects}
                            </h3>

                            <p>
                                Subjects evaluated
                            </p>

                        </div>

                        {/* ABSENT */}

                        <div className="stat-card">

                            <div className="stat-header">

                                <span>
                                    Absent Days
                                </span>

                                <div className="stat-icon">
                                    !
                                </div>

                            </div>

                            <h3>
                                {absentDays}
                            </h3>

                            <p>
                                Total absent days
                            </p>

                        </div>

                    </section>

                    {/* ================= TWO COLUMN ================= */}

                    <section className="dashboard-grid">

                        {/* ================= ATTENDANCE ================= */}

                        <div className="dashboard-card">

                            <div className="card-title">

                                <div>

                                    <span className="section-label">
                                        ATTENDANCE
                                    </span>

                                    <h2>
                                        Attendance Overview
                                    </h2>

                                </div>

                                <div className="percentage-badge">
                                    {attendancePercentage}%
                                </div>

                            </div>

                            <div className="attendance-visual">

                                <div className="progress-ring">

                                    <div className="ring-inner">

                                        <strong>
                                            {attendancePercentage}%
                                        </strong>

                                        <span>
                                            Attendance
                                        </span>

                                    </div>

                                </div>

                                <div className="attendance-details">

                                    <div>

                                        <span className="dot present"></span>

                                        <p>
                                            Present
                                        </p>

                                        <strong>
                                            {presentDays}
                                        </strong>

                                    </div>

                                    <div>

                                        <span className="dot absent"></span>

                                        <p>
                                            Absent
                                        </p>

                                        <strong>
                                            {absentDays}
                                        </strong>

                                    </div>

                                    <div>

                                        <span className="dot total"></span>

                                        <p>
                                            Total Days
                                        </p>

                                        <strong>
                                            {totalDays}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                            <button
                                className="view-btn"
                                onClick={() =>
                                    navigate("/attendance")
                                }
                            >
                                View Attendance →
                            </button>

                        </div>

                        {/* ================= ACADEMIC ================= */}

                        <div className="dashboard-card">

                            <div className="card-title">

                                <div>

                                    <span className="section-label">
                                        ACADEMICS
                                    </span>

                                    <h2>
                                        Academic Performance
                                    </h2>

                                </div>

                                <span className="score-label">
                                    Overall
                                </span>

                            </div>

                            <div className="score-display">

                                <strong>
                                    {academicPercentage}%
                                </strong>

                                <span>
                                    Overall Score
                                </span>

                            </div>

                            <div className="score-bar">

                                <div
                                    className="score-progress"
                                    style={{
                                        width: `${Math.min(
                                            academicPercentage,
                                            100
                                        )}%`
                                    }}
                                ></div>

                            </div>

                            <div className="marks-summary">

                                <div>

                                    <span>
                                        Obtained
                                    </span>

                                    <strong>
                                        {marksObtained}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Total Marks
                                    </span>

                                    <strong>
                                        {totalMarks}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Subjects
                                    </span>

                                    <strong>
                                        {subjects}
                                    </strong>

                                </div>

                            </div>

                            <button
                                className="view-btn"
                                onClick={() =>
                                    navigate("/academic")
                                }
                            >
                                View Academics →
                            </button>

                        </div>

                    </section>

                    {/* ================= COMPLAINTS ================= */}

                    <section
                        id="complaints-section"
                        className="dashboard-card complaints-card"
                    >

                        <div className="card-title">

                            <div>

                                <span className="section-label">
                                    STUDENT SUPPORT
                                </span>

                                <h2>
                                    My Complaints
                                </h2>

                            </div>

                            <span className="complaint-count">
                                {complaints.length}
                            </span>

                        </div>

                        {/* LOADING */}

                        {complaintsLoading ? (

                            <div className="empty-state">

                                <p>
                                    Loading complaints...
                                </p>

                            </div>

                        ) : complaintError ? (

                            <div className="empty-state">

                                <h3>
                                    Unable to load complaints
                                </h3>

                                <p>
                                    {complaintError}
                                </p>

                            </div>

                        ) : complaints.length === 0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No complaints
                                </h3>

                                <p>
                                    You currently have
                                    no complaints.
                                </p>

                            </div>

                        ) : (

                            <div className="complaints-list">

                                {complaints.map(
                                    (complaint) => (

                                        <div
                                            className="complaint-item"
                                            key={complaint._id}
                                        >

                                            {/* COMPLAINT DETAILS */}

                                            <div>

                                                <strong>
                                                    {complaint.title}
                                                </strong>

                                                <p>
                                                    {
                                                        complaint.description
                                                    }
                                                </p>

                                                <small>

                                                    {complaint.createdAt
                                                        ? new Date(
                                                            complaint.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : ""}

                                                    {complaint.teacher && (
                                                        <>
                                                            {" "}
                                                            • Teacher:{" "}
                                                            {
                                                                complaint.teacher.name ||
                                                                complaint.teacher.teacherId ||
                                                                "Teacher"
                                                            }
                                                        </>
                                                    )}

                                                </small>

                                            </div>

                                            {/* STATUS + RESPONSE */}

                                            <div>

                                                <span>
                                                    {
                                                        complaint.status
                                                    }
                                                </span>

                                                <p>

                                                    <strong>
                                                        Response:
                                                    </strong>{" "}

                                                    {
                                                        complaint.response ||
                                                        "No response yet"
                                                    }

                                                </p>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </div>

            </main>

        </div>
    );
}

export default StudentDashboard;