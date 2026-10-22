import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminAttendance.css";

function AdminAttendance() {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const adminName =
        user?.name ||
        user?.username ||
        "Administrator";

    // ========================================
    // FETCH ATTENDANCE
    // ========================================

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/attendance",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setAttendance(
                response.data.attendance || []
            );

        } catch (err) {
            console.error(
                "Fetch admin attendance error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load attendance."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // FILTER DATA
    // ========================================

    const filteredAttendance = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return attendance.filter((record) => {

            const student =
                record.student || {};

            const studentId =
                String(
                    student.studentId || ""
                ).toLowerCase();

            const studentName =
                String(
                    student.name || ""
                ).toLowerCase();

            const standard =
                String(
                    student.standard || ""
                ).toLowerCase();

            const markedBy =
                String(
                    record.markedBy?.username || ""
                ).toLowerCase();

            const matchesSearch =
                !query ||
                studentId.includes(query) ||
                studentName.includes(query) ||
                markedBy.includes(query);

            const matchesClass =
                classFilter === "all" ||
                String(student.standard) ===
                    String(classFilter);

            let matchesDate = true;

            if (dateFilter) {
                const recordDate = new Date(
                    record.date
                );

                const year =
                    recordDate.getFullYear();

                const month =
                    String(
                        recordDate.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        recordDate.getDate()
                    ).padStart(2, "0");

                const formattedDate =
                    `${year}-${month}-${day}`;

                matchesDate =
                    formattedDate === dateFilter;
            }

            return (
                matchesSearch &&
                matchesClass &&
                matchesDate
            );
        });
    }, [
        attendance,
        search,
        classFilter,
        dateFilter
    ]);

    // ========================================
    // UNIQUE CLASSES
    // ========================================

    const classes = useMemo(() => {
        const values = attendance
            .map(
                record =>
                    record.student?.standard
            )
            .filter(Boolean)
            .map(String);

        return [...new Set(values)].sort(
            (a, b) =>
                a.localeCompare(b, undefined, {
                    numeric: true
                })
        );
    }, [attendance]);

    // ========================================
    // SUMMARY
    // ========================================

    const presentCount =
        filteredAttendance.filter(
            record =>
                String(record.status)
                    .toLowerCase() === "present"
        ).length;

    const absentCount =
        filteredAttendance.filter(
            record =>
                String(record.status)
                    .toLowerCase() === "absent"
        ).length;

    const totalCount =
        filteredAttendance.length;

    const percentage =
        totalCount === 0
            ? 0
            : (
                (presentCount /
                    totalCount) *
                100
            ).toFixed(2);

    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(
            value
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
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
            <div className="admin-attendance-loading">

                <div className="admin-attendance-loader"></div>

                <p>
                    Loading attendance...
                </p>

            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error) {
        return (
            <div className="admin-attendance-error">

                <h2>
                    {error}
                </h2>

                <button
                    onClick={fetchAttendance}
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
        <div className="admin-attendance-layout">

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside className="admin-attendance-sidebar">

                <div className="admin-attendance-brand">

                    <div className="admin-attendance-logo">

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

                <nav className="admin-attendance-nav">

                    <div
                        className="admin-attendance-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin-dashboard"
                            )
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </div>

                    <div
                        className="admin-attendance-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/students"
                            )
                        }
                    >
                        <span>👤</span>
                        Students
                    </div>

                    <div
                        className="admin-attendance-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/teachers"
                            )
                        }
                    >
                        <span>◉</span>
                        Teachers
                    </div>

                    <div
                        className="admin-attendance-nav-item active"
                    >
                        <span>◷</span>
                        Attendance
                    </div>

                    <div
                        className="admin-attendance-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/marks"
                            )
                        }
                    >
                        <span>▣</span>
                        Marks
                    </div>

                    <div
                        className="admin-attendance-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                </nav>

                <div className="admin-attendance-sidebar-bottom">

                    <div className="admin-attendance-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                    <button
                        className="admin-attendance-logout"
                        onClick={logout}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* ========================================
                MAIN
            ======================================== */}

            <main className="admin-attendance-main">

                <header className="admin-attendance-topbar">

                    <div>

                        <p>
                            ADMIN PORTAL
                        </p>

                        <h2>
                            Attendance
                        </h2>

                    </div>

                    <div className="admin-attendance-profile">

                        <div className="admin-attendance-profile-text">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <div className="admin-attendance-avatar">

                            {adminName
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                <div className="admin-attendance-content">

                    {/* PAGE HEADING */}

                    <section className="admin-attendance-heading">

                        <div>

                            <span>
                                ATTENDANCE MANAGEMENT
                            </span>

                            <h1>
                                Attendance Records
                            </h1>

                            <p>
                                Review attendance across
                                the school.
                            </p>

                        </div>

                        <button
                            className="admin-attendance-refresh-btn"
                            onClick={fetchAttendance}
                        >
                            ↻ Refresh
                        </button>

                    </section>

                    {/* STATS */}

                    <section className="admin-attendance-stats">

                        <div className="admin-attendance-stat-card">

                            <span>
                                Total Records
                            </span>

                            <strong>
                                {totalCount}
                            </strong>

                        </div>

                        <div className="admin-attendance-stat-card">

                            <span>
                                Present
                            </span>

                            <strong>
                                {presentCount}
                            </strong>

                        </div>

                        <div className="admin-attendance-stat-card">

                            <span>
                                Absent
                            </span>

                            <strong>
                                {absentCount}
                            </strong>

                        </div>

                        <div className="admin-attendance-stat-card">

                            <span>
                                Attendance Rate
                            </span>

                            <strong>
                                {percentage}%
                            </strong>

                        </div>

                    </section>

                    {/* FILTERS */}

                    <section className="admin-attendance-filter-card">

                        <div className="admin-attendance-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search student ID, name or teacher..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <select
                            value={classFilter}
                            onChange={(e) =>
                                setClassFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Classes
                            </option>

                            {classes.map(
                                (className) => (

                                    <option
                                        key={className}
                                        value={className}
                                    >
                                        Class{" "}
                                        {className}
                                    </option>

                                )
                            )}

                        </select>

                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) =>
                                setDateFilter(
                                    e.target.value
                                )
                            }
                        />

                        <button
                            className="admin-attendance-clear-btn"
                            onClick={() => {
                                setSearch("");
                                setClassFilter("all");
                                setDateFilter("");
                            }}
                        >
                            Clear
                        </button>

                    </section>

                    {/* TABLE */}

                    <section className="admin-attendance-card">

                        <div className="admin-attendance-table-wrapper">

                            <table className="admin-attendance-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Class
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Marked By
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredAttendance.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="admin-attendance-empty"
                                            >
                                                No attendance records found.
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredAttendance.map(
                                            (record) => {

                                                const isPresent =
                                                    String(
                                                        record.status
                                                    ).toLowerCase() ===
                                                    "present";

                                                return (
                                                    <tr
                                                        key={
                                                            record._id
                                                        }
                                                    >

                                                        <td>

                                                            <div className="admin-attendance-student">

                                                                <div className="admin-attendance-student-avatar">

                                                                    {record
                                                                        .student
                                                                        ?.name
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}

                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            record
                                                                                .student
                                                                                ?.name ||
                                                                            "Unknown Student"
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            record
                                                                                .student
                                                                                ?.studentId ||
                                                                            "N/A"
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        <td>
                                                            {record
                                                                .student
                                                                ?.standard ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {formatDate(
                                                                record.date
                                                            )}
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={
                                                                    isPresent
                                                                        ? "admin-attendance-status present"
                                                                        : "admin-attendance-status absent"
                                                                }
                                                            >
                                                                {
                                                                    record.status
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>
                                                            {
                                                                record
                                                                    .markedBy
                                                                    ?.username ||
                                                                "Teacher"
                                                            }
                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}

export default AdminAttendance;