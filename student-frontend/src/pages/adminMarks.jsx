import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminMarks.css";

function AdminMarks() {
    const navigate = useNavigate();

    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [classFilter, setClassFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [examFilter, setExamFilter] = useState("all");

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const adminName =
        user?.name ||
        user?.username ||
        "Administrator";

    // ========================================
    // FETCH MARKS
    // ========================================

    useEffect(() => {
        fetchMarks();
    }, []);

    const fetchMarks = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/marks",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMarks(
                response.data.marks || []
            );

        } catch (err) {
            console.error(
                "Fetch admin marks error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load marks."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // UNIQUE FILTER VALUES
    // ========================================

    const classes = useMemo(() => {
        const values = marks
            .map(
                mark =>
                    mark.student?.standard
            )
            .filter(Boolean)
            .map(String);

        return [...new Set(values)].sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    { numeric: true }
                )
        );
    }, [marks]);

    const subjects = useMemo(() => {
        const values = marks
            .map(mark => mark.subject)
            .filter(Boolean);

        return [...new Set(values)].sort();
    }, [marks]);

    const exams = useMemo(() => {
        const values = marks
            .map(mark => mark.examType)
            .filter(Boolean);

        return [...new Set(values)].sort();
    }, [marks]);

    // ========================================
    // FILTER
    // ========================================

    const filteredMarks = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return marks.filter((mark) => {

            const student =
                mark.student || {};

            const teacher =
                mark.teacher || {};

            const studentId =
                String(
                    student.studentId || ""
                ).toLowerCase();

            const studentName =
                String(
                    student.name || ""
                ).toLowerCase();

            const teacherName =
                String(
                    teacher.name || ""
                ).toLowerCase();

            const teacherId =
                String(
                    teacher.teacherId || ""
                ).toLowerCase();

            const subject =
                String(
                    mark.subject || ""
                ).toLowerCase();

            const matchesSearch =
                !query ||
                studentId.includes(query) ||
                studentName.includes(query) ||
                teacherName.includes(query) ||
                teacherId.includes(query) ||
                subject.includes(query);

            const matchesClass =
                classFilter === "all" ||
                String(
                    student.standard
                ) === String(classFilter);

            const matchesSubject =
                subjectFilter === "all" ||
                mark.subject === subjectFilter;

            const matchesExam =
                examFilter === "all" ||
                mark.examType === examFilter;

            return (
                matchesSearch &&
                matchesClass &&
                matchesSubject &&
                matchesExam
            );
        });

    }, [
        marks,
        search,
        classFilter,
        subjectFilter,
        examFilter
    ]);

    // ========================================
    // SUMMARY
    // ========================================

    const totalRecords =
        filteredMarks.length;

    const totalMarks = filteredMarks.reduce(
        (sum, mark) =>
            sum + Number(mark.totalMarks || 0),
        0
    );

    const marksObtained =
        filteredMarks.reduce(
            (sum, mark) =>
                sum + Number(
                    mark.marksObtained || 0
                ),
            0
        );

    const averagePercentage =
        totalMarks === 0
            ? 0
            : (
                (marksObtained /
                    totalMarks) *
                100
            ).toFixed(2);

    // ========================================
    // CLEAR FILTERS
    // ========================================

    const clearFilters = () => {
        setSearch("");
        setClassFilter("all");
        setSubjectFilter("all");
        setExamFilter("all");
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
            <div className="admin-marks-loading">

                <div className="admin-marks-loader"></div>

                <p>
                    Loading marks...
                </p>

            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error) {
        return (
            <div className="admin-marks-error">

                <h2>
                    {error}
                </h2>

                <button
                    onClick={fetchMarks}
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
        <div className="admin-marks-layout">

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside className="admin-marks-sidebar">

                <div className="admin-marks-brand">

                    <div className="admin-marks-logo">

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

                <nav className="admin-marks-nav">

                    <div
                        className="admin-marks-nav-item"
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
                        className="admin-marks-nav-item"
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
                        className="admin-marks-nav-item"
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
                        className="admin-marks-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/attendance"
                            )
                        }
                    >
                        <span>◷</span>
                        Attendance
                    </div>

                    <div
                        className="admin-marks-nav-item active"
                    >
                        <span>▣</span>
                        Marks
                    </div>

                    <div
                        className="admin-marks-nav-item"
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

                <div className="admin-marks-sidebar-bottom">

                    <div className="admin-marks-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                    <button
                        className="admin-marks-logout"
                        onClick={logout}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* ========================================
                MAIN
            ======================================== */}

            <main className="admin-marks-main">

                {/* TOPBAR */}

                <header className="admin-marks-topbar">

                    <div>

                        <p>
                            ADMIN PORTAL
                        </p>

                        <h2>
                            Marks
                        </h2>

                    </div>

                    <div className="admin-marks-profile">

                        <div className="admin-marks-profile-text">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <div className="admin-marks-avatar">
                            {adminName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                    </div>

                </header>

                {/* CONTENT */}

                <div className="admin-marks-content">

                    {/* HEADING */}

                    <section className="admin-marks-heading">

                        <div>

                            <span>
                                ACADEMIC MANAGEMENT
                            </span>

                            <h1>
                                Marks & Results
                            </h1>

                            <p>
                                Review student academic
                                performance across the school.
                            </p>

                        </div>

                        <button
                            className="admin-marks-refresh-btn"
                            onClick={fetchMarks}
                        >
                            ↻ Refresh
                        </button>

                    </section>

                    {/* SUMMARY */}

                    <section className="admin-marks-stats">

                        <div className="admin-marks-stat-card">

                            <span>
                                Total Records
                            </span>

                            <strong>
                                {totalRecords}
                            </strong>

                        </div>

                        <div className="admin-marks-stat-card">

                            <span>
                                Marks Obtained
                            </span>

                            <strong>
                                {marksObtained}
                            </strong>

                        </div>

                        <div className="admin-marks-stat-card">

                            <span>
                                Total Marks
                            </span>

                            <strong>
                                {totalMarks}
                            </strong>

                        </div>

                        <div className="admin-marks-stat-card">

                            <span>
                                Average %
                            </span>

                            <strong>
                                {averagePercentage}%
                            </strong>

                        </div>

                    </section>

                    {/* FILTERS */}

                    <section className="admin-marks-filter-card">

                        <div className="admin-marks-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search student, teacher or subject..."
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
                                        Class {className}
                                    </option>

                                )
                            )}

                        </select>

                        <select
                            value={subjectFilter}
                            onChange={(e) =>
                                setSubjectFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Subjects
                            </option>

                            {subjects.map(
                                (subject) => (

                                    <option
                                        key={subject}
                                        value={subject}
                                    >
                                        {subject}
                                    </option>

                                )
                            )}

                        </select>

                        <select
                            value={examFilter}
                            onChange={(e) =>
                                setExamFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Exams
                            </option>

                            {exams.map(
                                (exam) => (

                                    <option
                                        key={exam}
                                        value={exam}
                                    >
                                        {exam}
                                    </option>

                                )
                            )}

                        </select>

                        <button
                            className="admin-marks-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>

                    </section>

                    {/* TABLE */}

                    <section className="admin-marks-card">

                        <div className="admin-marks-table-wrapper">

                            <table className="admin-marks-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Class
                                        </th>

                                        <th>
                                            Subject
                                        </th>

                                        <th>
                                            Exam
                                        </th>

                                        <th>
                                            Marks
                                        </th>

                                        <th>
                                            Grade
                                        </th>

                                        <th>
                                            Teacher
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredMarks.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="admin-marks-empty"
                                            >
                                                No marks records found.
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredMarks.map(
                                            (mark) => (

                                                <tr
                                                    key={
                                                        mark._id
                                                    }
                                                >

                                                    <td>

                                                        <div className="admin-marks-student">

                                                            <div className="admin-marks-student-avatar">

                                                                {mark.student?.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}

                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        mark.student?.name ||
                                                                        "Unknown Student"
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        mark.student?.studentId ||
                                                                        "N/A"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {mark.student?.standard ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {mark.subject ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {mark.examType ||
                                                            "-"}
                                                    </td>

                                                    <td>

                                                        <span className="admin-marks-score">
                                                            {
                                                                mark.marksObtained
                                                            }
                                                            /
                                                            {
                                                                mark.totalMarks
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <span className="admin-marks-grade">
                                                            {
                                                                mark.grade ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>
                                                        {
                                                            mark.teacher?.name ||
                                                            mark.teacher?.teacherId ||
                                                            "Teacher"
                                                        }
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

        </div>
    );
}

export default AdminMarks;