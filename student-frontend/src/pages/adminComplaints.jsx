import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminComplaints.css";

function AdminComplaints() {
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [responseText, setResponseText] = useState("");
    const [selectedStatus, setSelectedStatus] =
        useState("Pending");

    const [updating, setUpdating] = useState(false);

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const adminName =
        user?.name ||
        user?.username ||
        "Administrator";

    // ========================================
    // FETCH COMPLAINTS
    // ========================================

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/complaints",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setComplaints(
                response.data.complaints || []
            );

        } catch (err) {
            console.error(
                "Fetch complaints error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load complaints."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // FILTER
    // ========================================

    const filteredComplaints = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return complaints.filter(
            (complaint) => {

                const student =
                    complaint.student || {};

                const teacher =
                    complaint.teacher || {};

                const studentId =
                    String(
                        student.studentId || ""
                    ).toLowerCase();

                const studentName =
                    String(
                        student.name || ""
                    ).toLowerCase();

                const teacherId =
                    String(
                        teacher.teacherId || ""
                    ).toLowerCase();

                const teacherName =
                    String(
                        teacher.name || ""
                    ).toLowerCase();

                const title =
                    String(
                        complaint.title || ""
                    ).toLowerCase();

                const description =
                    String(
                        complaint.description || ""
                    ).toLowerCase();

                const matchesSearch =
                    !query ||
                    studentId.includes(query) ||
                    studentName.includes(query) ||
                    teacherId.includes(query) ||
                    teacherName.includes(query) ||
                    title.includes(query) ||
                    description.includes(query);

                const matchesStatus =
                    statusFilter === "all" ||
                    complaint.status ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        complaints,
        search,
        statusFilter
    ]);

    // ========================================
    // COUNTS
    // ========================================

    const pendingCount =
        complaints.filter(
            complaint =>
                complaint.status === "Pending"
        ).length;

    const progressCount =
        complaints.filter(
            complaint =>
                complaint.status === "In Progress"
        ).length;

    const resolvedCount =
        complaints.filter(
            complaint =>
                complaint.status === "Resolved"
        ).length;

    // ========================================
    // OPEN COMPLAINT
    // ========================================

    const openComplaint = (complaint) => {
        setSelectedComplaint(complaint);

        setSelectedStatus(
            complaint.status || "Pending"
        );

        setResponseText(
            complaint.response || ""
        );

        setMessage("");
        setError("");
    };

    // ========================================
    // CLOSE COMPLAINT
    // ========================================

    const closeComplaint = () => {
        if (updating) {
            return;
        }

        setSelectedComplaint(null);
        setResponseText("");
        setSelectedStatus("Pending");
    };

    // ========================================
    // UPDATE COMPLAINT
    // ========================================

    const updateComplaint = async () => {

        if (!selectedComplaint) {
            return;
        }

        try {
            setUpdating(true);
            setMessage("");
            setError("");

            const response =
                await axios.put(
                    `http://localhost:5000/api/complaints/${selectedComplaint._id}`,
                    {
                        status:
                            selectedStatus,
                        response:
                            responseText.trim()
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
                "Complaint updated successfully."
            );

            await fetchComplaints();

            setSelectedComplaint(null);
            setResponseText("");

        } catch (err) {
            console.error(
                "Update complaint error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to update complaint."
            );

        } finally {
            setUpdating(false);
        }
    };

    // ========================================
    // DELETE COMPLAINT
    // ========================================

    const deleteComplaint = async (complaint) => {

        const confirmed = window.confirm(
            `Delete this complaint from ${complaint.student?.name || "this student"}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response =
                await axios.delete(
                    `http://localhost:5000/api/complaints/${complaint._id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setMessage(
                response.data.message ||
                "Complaint deleted successfully."
            );

            await fetchComplaints();

        } catch (err) {
            console.error(
                "Delete complaint error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to delete complaint."
            );
        }
    };

    // ========================================
    // CLEAR FILTERS
    // ========================================

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
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
            <div className="admin-complaints-loading">
                <div className="admin-complaints-loader"></div>

                <p>
                    Loading complaints...
                </p>
            </div>
        );
    }

    // ========================================
    // ERROR
    // ========================================

    if (error && complaints.length === 0) {
        return (
            <div className="admin-complaints-error">

                <h2>
                    {error}
                </h2>

                <button
                    onClick={fetchComplaints}
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
        <div className="admin-complaints-layout">

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside className="admin-complaints-sidebar">

                <div className="admin-complaints-brand">

                    <div className="admin-complaints-logo">

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

                <nav className="admin-complaints-nav">

                    <div
                        className="admin-complaints-nav-item"
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
                        className="admin-complaints-nav-item"
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
                        className="admin-complaints-nav-item"
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
                        className="admin-complaints-nav-item"
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
                        className="admin-complaints-nav-item"
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
                        className="admin-complaints-nav-item active"
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                </nav>

                <div className="admin-complaints-sidebar-bottom">

                    <div className="admin-complaints-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                    <button
                        className="admin-complaints-logout"
                        onClick={logout}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* ========================================
                MAIN
            ======================================== */}

            <main className="admin-complaints-main">

                <header className="admin-complaints-topbar">

                    <div>

                        <p>
                            ADMIN PORTAL
                        </p>

                        <h2>
                            Complaints
                        </h2>

                    </div>

                    <div className="admin-complaints-profile">

                        <div className="admin-complaints-profile-text">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <div className="admin-complaints-avatar">

                            {adminName
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                <div className="admin-complaints-content">

                    {/* HEADING */}

                    <section className="admin-complaints-heading">

                        <div>

                            <span>
                                STUDENT SUPPORT
                            </span>

                            <h1>
                                Complaint Management
                            </h1>

                            <p>
                                Review and manage student
                                complaints across the school.
                            </p>

                        </div>

                        <button
                            className="admin-complaints-refresh-btn"
                            onClick={fetchComplaints}
                        >
                            ↻ Refresh
                        </button>

                    </section>

                    {/* MESSAGE */}

                    {message && (
                        <div className="admin-complaints-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="admin-complaints-error-message">
                            {error}
                        </div>
                    )}

                    {/* STATUS CARDS */}

                    <section className="admin-complaints-stats">

                        <div className="admin-complaints-stat-card">

                            <span>
                                Total Complaints
                            </span>

                            <strong>
                                {complaints.length}
                            </strong>

                        </div>

                        <div className="admin-complaints-stat-card">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>

                        </div>

                        <div className="admin-complaints-stat-card">

                            <span>
                                In Progress
                            </span>

                            <strong>
                                {progressCount}
                            </strong>

                        </div>

                        <div className="admin-complaints-stat-card">

                            <span>
                                Resolved
                            </span>

                            <strong>
                                {resolvedCount}
                            </strong>

                        </div>

                    </section>

                    {/* FILTERS */}

                    <section className="admin-complaints-filter">

                        <div className="admin-complaints-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search student, teacher or complaint..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Statuses
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="In Progress">
                                In Progress
                            </option>

                            <option value="Resolved">
                                Resolved
                            </option>

                        </select>

                        <button
                            className="admin-complaints-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>

                    </section>

                    {/* TABLE */}

                    <section className="admin-complaints-card">

                        <div className="admin-complaints-table-wrapper">

                            <table className="admin-complaints-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Complaint
                                        </th>

                                        <th>
                                            Teacher
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredComplaints.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="admin-complaints-empty"
                                            >
                                                No complaints found.
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredComplaints.map(
                                            (complaint) => (

                                                <tr
                                                    key={
                                                        complaint._id
                                                    }
                                                >

                                                    <td>

                                                        <div className="admin-complaint-student">

                                                            <div className="admin-complaint-student-avatar">

                                                                {complaint.student
                                                                    ?.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}

                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        complaint.student?.name ||
                                                                        "Unknown"
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        complaint.student?.studentId ||
                                                                        "N/A"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td>

                                                        <div className="admin-complaint-title">

                                                            <strong>
                                                                {
                                                                    complaint.title
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    complaint.description
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {
                                                            complaint.teacher?.name ||
                                                            complaint.teacher?.teacherId ||
                                                            "Teacher"
                                                        }
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                complaint.status ===
                                                                "Resolved"
                                                                    ? "complaint-status resolved"
                                                                    : complaint.status ===
                                                                      "In Progress"
                                                                    ? "complaint-status progress"
                                                                    : "complaint-status pending"
                                                            }
                                                        >
                                                            {
                                                                complaint.status
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        {new Date(
                                                            complaint.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )}

                                                    </td>

                                                    <td>

                                                        <div className="admin-complaint-actions">

                                                            <button
                                                                className="admin-complaint-view-btn"
                                                                onClick={() =>
                                                                    openComplaint(
                                                                        complaint
                                                                    )
                                                                }
                                                            >
                                                                Review
                                                            </button>

                                                            <button
                                                                className="admin-complaint-delete-btn"
                                                                onClick={() =>
                                                                    deleteComplaint(
                                                                        complaint
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
                REVIEW MODAL
            ======================================== */}

            {selectedComplaint && (

                <div className="admin-complaints-modal-overlay">

                    <div className="admin-complaints-modal">

                        <div className="admin-complaints-modal-header">

                            <div>

                                <span>
                                    COMPLAINT REVIEW
                                </span>

                                <h2>
                                    {
                                        selectedComplaint.title
                                    }
                                </h2>

                            </div>

                            <button
                                className="admin-complaints-close"
                                onClick={closeComplaint}
                                disabled={updating}
                            >
                                ×
                            </button>

                        </div>

                        <div className="admin-complaints-modal-body">

                            {/* STUDENT */}

                            <div className="admin-complaints-info">

                                <span>
                                    STUDENT
                                </span>

                                <strong>
                                    {
                                        selectedComplaint.student?.name ||
                                        "Unknown Student"
                                    }
                                </strong>

                                <small>
                                    {
                                        selectedComplaint.student?.studentId ||
                                        "N/A"
                                    }
                                </small>

                            </div>

                            {/* TEACHER */}

                            <div className="admin-complaints-info">

                                <span>
                                    TEACHER
                                </span>

                                <strong>
                                    {
                                        selectedComplaint.teacher?.name ||
                                        "Teacher"
                                    }
                                </strong>

                                <small>
                                    {
                                        selectedComplaint.teacher?.teacherId ||
                                        ""
                                    }
                                </small>

                            </div>

                            {/* DESCRIPTION */}

                            <div className="admin-complaints-description">

                                <span>
                                    DESCRIPTION
                                </span>

                                <p>
                                    {
                                        selectedComplaint.description
                                    }
                                </p>

                            </div>

                            {/* STATUS */}

                            <div className="admin-complaints-form-field">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={
                                        selectedStatus
                                    }
                                    onChange={(e) =>
                                        setSelectedStatus(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="Pending">
                                        Pending
                                    </option>

                                    <option value="In Progress">
                                        In Progress
                                    </option>

                                    <option value="Resolved">
                                        Resolved
                                    </option>

                                </select>

                            </div>

                            {/* RESPONSE */}

                            <div className="admin-complaints-form-field">

                                <label>
                                    Admin Response
                                </label>

                                <textarea
                                    placeholder="Enter a response..."
                                    value={
                                        responseText
                                    }
                                    onChange={(e) =>
                                        setResponseText(
                                            e.target.value
                                        )
                                    }
                                    rows="5"
                                ></textarea>

                            </div>

                        </div>

                        <div className="admin-complaints-modal-actions">

                            <button
                                className="admin-complaints-cancel-btn"
                                onClick={closeComplaint}
                                disabled={updating}
                            >
                                Cancel
                            </button>

                            <button
                                className="admin-complaints-save-btn"
                                onClick={updateComplaint}
                                disabled={updating}
                            >
                                {updating
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminComplaints;