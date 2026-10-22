import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        todayAttendance: 0,
        pendingComplaints: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const adminName =
        user?.name ||
        user?.username ||
        "Administrator";

    // ========================================
    // LOAD ADMIN DASHBOARD
    // ========================================

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    "http://localhost:5000/api/admin/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setStats(
                    response.data.statistics || {
                        totalStudents: 0,
                        totalTeachers: 0,
                        todayAttendance: 0,
                        pendingComplaints: 0
                    }
                );

            } catch (err) {
                console.error(
                    "Admin dashboard error:",
                    err
                );

                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate("/");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Failed to load admin dashboard"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate, token]);

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
            <div className="admin-loading">

                <div className="admin-loader"></div>

                <p>
                    Loading admin dashboard...
                </p>

            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error) {
        return (
            <div className="admin-error">

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
    // DASHBOARD
    // ========================================

    return (
        <div className="admin-layout">

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside className="admin-sidebar">

                {/* BRAND */}

                <div className="admin-brand">

                    <div className="admin-logo">

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

                <nav className="admin-nav">

                    {/* DASHBOARD */}

                    <div
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </div>

                    {/* STUDENTS */}

                    <div
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>👤</span>
                        Students
                    </div>

                    {/* TEACHERS */}

                    <div
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        <span>◉</span>
                        Teachers
                    </div>

                    {/* ATTENDANCE */}

                    <div
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/attendance")
                        }
                    >
                        <span>◷</span>
                        Attendance
                    </div>

                    {/* MARKS */}

                    <div
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/marks")
                        }
                    >
                        <span>▣</span>
                        Marks
                    </div>

                    {/* COMPLAINTS */}

                    <div
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/complaints")
                        }
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                    {/* NOTICES */}

                    <div
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/notices")
                        }
                    >
                        <span>✉</span>
                        Notices
                    </div>

                </nav>

                {/* SIDEBAR BOTTOM */}

                <div className="admin-sidebar-bottom">

                    <div className="admin-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                    <button
                        className="admin-logout"
                        onClick={logout}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* ========================================
                MAIN
            ======================================== */}

            <main className="admin-main">

                {/* TOPBAR */}

                <header className="admin-topbar">

                    <div>

                        <p>
                            ADMIN PORTAL
                        </p>

                        <h2>
                            Dashboard
                        </h2>

                    </div>

                    <div className="admin-profile">

                        <div className="admin-profile-text">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <div className="admin-avatar">

                            {adminName
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                {/* CONTENT */}

                <div className="admin-content">

                    {/* WELCOME */}

                    <section className="admin-welcome">

                        <span>
                            PRIYADHARSHINIE PUBLIC SCHOOL
                        </span>

                        <h1>
                            Welcome, {adminName}
                        </h1>

                        <p>
                            Manage students, teachers,
                            attendance, academics,
                            communication and student
                            support from one place.
                        </p>

                    </section>

                    {/* STATISTICS */}

                    <section className="admin-stats">

                        <div className="admin-stat-card">

                            <div className="admin-stat-icon">
                                👥
                            </div>

                            <span>
                                Total Students
                            </span>

                            <strong>
                                {stats.totalStudents}
                            </strong>

                        </div>

                        <div className="admin-stat-card">

                            <div className="admin-stat-icon">
                                ◉
                            </div>

                            <span>
                                Total Teachers
                            </span>

                            <strong>
                                {stats.totalTeachers}
                            </strong>

                        </div>

                        <div className="admin-stat-card">

                            <div className="admin-stat-icon">
                                ◷
                            </div>

                            <span>
                                Today's Attendance
                            </span>

                            <strong>
                                {stats.todayAttendance}
                            </strong>

                        </div>

                        <div className="admin-stat-card">

                            <div className="admin-stat-icon">
                                ⚑
                            </div>

                            <span>
                                Pending Complaints
                            </span>

                            <strong>
                                {stats.pendingComplaints}
                            </strong>

                        </div>

                    </section>

                    {/* QUICK ACTIONS */}

                    <section className="admin-section">

                        <div className="admin-section-header">

                            <div>

                                <span>
                                    MANAGEMENT
                                </span>

                                <h2>
                                    Quick Actions
                                </h2>

                            </div>

                        </div>

                        <div className="admin-actions">

                            {/* STUDENTS */}

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/students"
                                    )
                                }
                            >
                                <strong>
                                    Students
                                </strong>

                                <span>
                                    Manage student records →
                                </span>
                            </button>

                            {/* TEACHERS */}

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/teachers"
                                    )
                                }
                            >
                                <strong>
                                    Teachers
                                </strong>

                                <span>
                                    Manage teacher records →
                                </span>
                            </button>

                            {/* ATTENDANCE */}

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/attendance"
                                    )
                                }
                            >
                                <strong>
                                    Attendance
                                </strong>

                                <span>
                                    View attendance records →
                                </span>
                            </button>

                            {/* MARKS */}

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/marks"
                                    )
                                }
                            >
                                <strong>
                                    Marks
                                </strong>

                                <span>
                                    View academic records →
                                </span>
                            </button>

                            {/* COMPLAINTS */}

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/complaints"
                                    )
                                }
                            >
                                <strong>
                                    Complaints
                                </strong>

                                <span>
                                    Review complaints →
                                </span>
                            </button>

                            {/* NOTICES */}

                            <button
                                onClick={() =>
                                    navigate(
                                        "/admin/notices"
                                    )
                                }
                            >
                                <strong>
                                    Notices
                                </strong>
<div
    className="admin-nav-item"
    onClick={() =>
        navigate("/admin/calendar")
    }
>
    <span>▦</span>
    Calendar
</div>
                                <span>
                                    Manage school communication →
                                </span>
                            </button>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}

export default AdminDashboard;