import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./studentNotice.css";

function StudentNotices() {
    const navigate = useNavigate();

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const studentName =
        user?.name ||
        user?.username ||
        "Student";

    // ========================================
    // LOAD NOTICES
    // ========================================

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/notices/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setNotices(
                response.data.notices || []
            );

        } catch (err) {
            console.error(
                "Fetch student notices error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load notices."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // HELPERS
    // ========================================

    const formatType = (type) => {
        if (!type) {
            return "General";
        }

        return type
            .split("-")
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    const formatDate = (date) => {
        if (!date) {
            return null;
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getAudience = (notice) => {
        if (notice.audienceType === "all") {
            return "Entire School";
        }

        if (notice.audienceType === "class") {
            return `Class ${notice.targetClass}`;
        }

        if (notice.audienceType === "student") {
            return "Personal Notice";
        }

        if (notice.audienceType === "teachers") {
            return "Teachers";
        }

        return "School";
    };

    // ========================================
    // LOGOUT
    // ========================================

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="student-notices-loading">
                <div className="student-notices-loader"></div>

                <p>
                    Loading notices...
                </p>
            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error) {
        return (
            <div className="student-notices-error">
                <h2>
                    {error}
                </h2>

                <button
                    onClick={fetchNotices}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ========================================
    // PAGE
    // ========================================

    return (
        <div className="student-notices-layout">

            {/* SIDEBAR */}

            <aside className="student-notices-sidebar">

                <div className="student-notices-brand">

                    <div className="student-notices-logo">

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

                <nav className="student-notices-nav">

                    <div
                        className="student-notices-nav-item"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </div>

                    <div
                        className="student-notices-nav-item"
                        onClick={() =>
                            navigate("/attendance")
                        }
                    >
                        <span>◷</span>
                        Attendance
                    </div>

                    <div
                        className="student-notices-nav-item"
                        onClick={() =>
                            navigate("/academic")
                        }
                    >
                        <span>▣</span>
                        Academic
                    </div>

                    <div
                        className="student-notices-nav-item active"
                    >
                        <span>✉</span>
                        Notices
                    </div>

                    <div
                        className="student-notices-nav-item"
                        onClick={() =>
                            navigate("/complaints")
                        }
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                </nav>

                <div className="student-notices-sidebar-bottom">

                    <div className="student-notices-student">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            {studentName}
                        </strong>

                    </div>

                    <button
                        className="student-notices-logout"
                        onClick={handleLogout}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* MAIN */}

            <main className="student-notices-main">

                {/* TOPBAR */}

                <header className="student-notices-topbar">

                    <div>

                        <p>
                            STUDENT PORTAL
                        </p>

                        <h2>
                            Notices
                        </h2>

                    </div>

                    <div className="student-notices-profile">

                        <div className="student-notices-profile-text">

                            <strong>
                                {studentName}
                            </strong>

                            <span>
                                Student
                            </span>

                        </div>

                        <div className="student-notices-avatar">

                            {studentName
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                {/* CONTENT */}

                <div className="student-notices-content">

                    <section className="student-notices-heading">

                        <span>
                            SCHOOL COMMUNICATION
                        </span>

                        <h1>
                            Notices & Announcements
                        </h1>

                        <p>
                            Important updates and messages from your school.
                        </p>

                    </section>

                    {/* NOTICE LIST */}

                    {notices.length === 0 ? (

                        <div className="student-notices-empty">

                            <div className="student-notices-empty-icon">
                                ✉
                            </div>

                            <h3>
                                No notices
                            </h3>

                            <p>
                                You don't have any school notices right now.
                            </p>

                        </div>

                    ) : (

                        <div className="student-notices-list">

                            {notices.map(
                                (notice) => (

                                    <article
                                        className={`student-notice-card ${notice.priority || "normal"}`}
                                        key={notice._id}
                                    >

                                        <div className="student-notice-card-header">

                                            <div>

                                                <div className="student-notice-badges">

                                                    <span className="student-notice-type">

                                                        {formatType(
                                                            notice.noticeType
                                                        )}

                                                    </span>

                                                    <span
                                                        className={`student-notice-priority ${notice.priority || "normal"}`}
                                                    >
                                                        {notice.priority || "normal"}
                                                    </span>

                                                </div>

                                                <h2>
                                                    {notice.title}
                                                </h2>

                                            </div>

                                        </div>

                                        <p className="student-notice-message">

                                            {notice.message}

                                        </p>

                                        <div className="student-notice-meta">

                                            <span>
                                                <strong>
                                                    Audience:
                                                </strong>{" "}
                                                {getAudience(
                                                    notice
                                                )}
                                            </span>

                                            {notice.eventDate && (
                                                <span>
                                                    <strong>
                                                        Date:
                                                    </strong>{" "}
                                                    {formatDate(
                                                        notice.eventDate
                                                    )}
                                                </span>
                                            )}

                                            {notice.eventTime && (
                                                <span>
                                                    <strong>
                                                        Time:
                                                    </strong>{" "}
                                                    {notice.eventTime}
                                                </span>
                                            )}

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default StudentNotices;