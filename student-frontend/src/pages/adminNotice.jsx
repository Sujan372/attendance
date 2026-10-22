import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminNotice.css";

function AdminNotice() {
    const navigate = useNavigate();

    const [notices, setNotices] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        noticeType: "general",
        audienceType: "all",
        targetClass: "",
        targetStudent: "",
        eventDate: "",
        eventTime: "",
        priority: "normal",
        expiresAt: ""
    });

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const adminName =
        user?.name ||
        user?.username ||
        "Administrator";

    // ========================================
    // LOAD DATA
    // ========================================

    useEffect(() => {
        fetchNotices();
        fetchStudents();
    }, []);

    const fetchNotices = async () => {
        try {
            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/notices",
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
                "Fetch notices error:",
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

    const fetchStudents = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/admin/students",
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
        }
    };

    // ========================================
    // FORM
    // ========================================

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            message: "",
            noticeType: "general",
            audienceType: "all",
            targetClass: "",
            targetStudent: "",
            eventDate: "",
            eventTime: "",
            priority: "normal",
            expiresAt: ""
        });
    };

    const openForm = () => {
        resetForm();
        setMessage("");
        setError("");
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        resetForm();
    };

    // ========================================
    // CREATE NOTICE
    // ========================================

    const createNotice = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!formData.title.trim()) {
            setError("Please enter a notice title.");
            return;
        }

        if (!formData.message.trim()) {
            setError("Please enter the notice message.");
            return;
        }

        if (
            formData.audienceType === "class" &&
            !formData.targetClass
        ) {
            setError("Please select a class.");
            return;
        }

        if (
            formData.audienceType === "student" &&
            !formData.targetStudent
        ) {
            setError("Please select a student.");
            return;
        }

        try {
            setSaving(true);

            const response = await axios.post(
                "http://localhost:5000/api/notices",
                {
                    title: formData.title.trim(),
                    message: formData.message.trim(),

                    noticeType:
                        formData.noticeType,

                    audienceType:
                        formData.audienceType,

                    targetClass:
                        formData.audienceType === "class"
                            ? formData.targetClass
                            : null,

                    targetStudent:
                        formData.audienceType === "student"
                            ? formData.targetStudent
                            : null,

                    eventDate:
                        formData.eventDate || null,

                    eventTime:
                        formData.eventTime || null,

                    priority:
                        formData.priority,

                    expiresAt:
                        formData.expiresAt || null
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
                "Notice created successfully."
            );

            closeForm();
            await fetchNotices();

        } catch (err) {
            console.error(
                "Create notice error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to create notice."
            );

        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // DELETE
    // ========================================

    const deleteNotice = async (notice) => {

        const confirmed = window.confirm(
            `Delete "${notice.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response =
                await axios.delete(
                    `http://localhost:5000/api/notices/${notice._id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setMessage(
                response.data.message ||
                "Notice deleted successfully."
            );

            await fetchNotices();

        } catch (err) {
            console.error(
                "Delete notice error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to delete notice."
            );
        }
    };

    // ========================================
    // FILTER
    // ========================================

    const filteredNotices = notices.filter(
        (notice) => {

            const query =
                search.trim().toLowerCase();

            if (!query) {
                return true;
            }

            return (
                notice.title
                    ?.toLowerCase()
                    .includes(query) ||

                notice.message
                    ?.toLowerCase()
                    .includes(query) ||

                notice.noticeType
                    ?.toLowerCase()
                    .includes(query) ||

                notice.audienceType
                    ?.toLowerCase()
                    .includes(query)
            );
        }
    );

    // ========================================
    // HELPERS
    // ========================================

    const formatType = (type) => {
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
            return "—";
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

    const getAudienceText = (notice) => {
        if (notice.audienceType === "all") {
            return "Entire School";
        }

        if (notice.audienceType === "class") {
            return `Class ${notice.targetClass}`;
        }

        if (notice.audienceType === "student") {
            return (
                notice.targetStudent?.name ||
                "Specific Student"
            );
        }

        if (notice.audienceType === "teachers") {
            return "Teachers";
        }

        return notice.audienceType;
    };

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="admin-notice-layout">

                <main className="admin-notice-main">

                    <div className="admin-notice-loading">

                        <div className="admin-notice-loader"></div>

                        <p>
                            Loading notices...
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
        <div className="admin-notice-layout">

            {/* SIDEBAR */}

            <aside className="admin-notice-sidebar">

                <div className="admin-notice-brand">

                    <div className="admin-notice-logo">

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

                <nav className="admin-notice-nav">

                    <div
                        className="admin-notice-nav-item"
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
                        className="admin-notice-nav-item"
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
                        className="admin-notice-nav-item"
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
                        className="admin-notice-nav-item"
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
                        className="admin-notice-nav-item"
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
                        className="admin-notice-nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                    <div
                        className="admin-notice-nav-item active"
                    >
                        <span>✉</span>
                        Notices
                    </div>

                </nav>

                <div className="admin-notice-sidebar-bottom">

                    <div className="admin-notice-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                    <button
                        className="admin-notice-logout"
                        onClick={() => {
                            localStorage.clear();
                            navigate("/");
                        }}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* MAIN */}

            <main className="admin-notice-main">

                <header className="admin-notice-topbar">

                    <div>

                        <p>
                            ADMIN PORTAL
                        </p>

                        <h2>
                            Notices & Communication
                        </h2>

                    </div>

                    <div className="admin-notice-profile">

                        <div className="admin-notice-profile-text">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <div className="admin-notice-avatar">

                            {adminName
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                <div className="admin-notice-content">

                    {/* HEADING */}

                    <section className="admin-notice-heading">

                        <div>

                            <span>
                                SCHOOL COMMUNICATION
                            </span>

                            <h1>
                                Notices
                            </h1>

                            <p>
                                Create and manage school announcements,
                                alerts and messages.
                            </p>

                        </div>

                        <button
                            className="admin-notice-add-btn"
                            onClick={openForm}
                        >
                            + Create Notice
                        </button>

                    </section>

                    {/* MESSAGES */}

                    {message && (
                        <div className="admin-notice-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="admin-notice-error">
                            {error}
                        </div>
                    )}

                    {/* TOOLBAR */}

                    <section className="admin-notice-toolbar">

                        <div className="admin-notice-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search notices..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="admin-notice-count">
                            {filteredNotices.length} Notices
                        </div>

                    </section>

                    {/* NOTICE CARDS */}

                    <section className="admin-notice-list">

                        {filteredNotices.length === 0 ? (

                            <div className="admin-notice-empty">

                                <div>
                                    ✉
                                </div>

                                <strong>
                                    No notices found
                                </strong>

                                <p>
                                    Create your first school notice.
                                </p>

                            </div>

                        ) : (

                            filteredNotices.map(
                                (notice) => (

                                    <article
                                        className="admin-notice-card"
                                        key={notice._id}
                                    >

                                        <div className="admin-notice-card-top">

                                            <div>

                                                <div className="admin-notice-badges">

                                                    <span className={`admin-notice-type ${notice.noticeType}`}>
                                                        {formatType(
                                                            notice.noticeType
                                                        )}
                                                    </span>

                                                    <span className={`admin-notice-priority ${notice.priority}`}>
                                                        {notice.priority}
                                                    </span>

                                                </div>

                                                <h3>
                                                    {notice.title}
                                                </h3>

                                            </div>

                                            <button
                                                className="admin-notice-delete-btn"
                                                onClick={() =>
                                                    deleteNotice(
                                                        notice
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                        <p className="admin-notice-message">
                                            {notice.message}
                                        </p>

                                        <div className="admin-notice-meta">

                                            <span>
                                                <strong>
                                                    Audience:
                                                </strong>{" "}
                                                {getAudienceText(
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

                                            <span>
                                                <strong>
                                                    Created:
                                                </strong>{" "}
                                                {formatDate(
                                                    notice.createdAt
                                                )}
                                            </span>

                                        </div>

                                    </article>

                                )
                            )

                        )}

                    </section>

                </div>

            </main>

            {/* CREATE NOTICE MODAL */}

            {showForm && (

                <div className="admin-notice-modal-overlay">

                    <div className="admin-notice-modal">

                        <div className="admin-notice-modal-header">

                            <div>

                                <span>
                                    SCHOOL COMMUNICATION
                                </span>

                                <h2>
                                    Create Notice
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-notice-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="admin-notice-form"
                            onSubmit={createNotice}
                        >

                            {/* TITLE */}

                            <div className="admin-notice-field full">

                                <label>
                                    Notice Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Holiday Notice"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* TYPE */}

                            <div className="admin-notice-field">

                                <label>
                                    Notice Type
                                </label>

                                <select
                                    name="noticeType"
                                    value={
                                        formData.noticeType
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="general">
                                        General
                                    </option>

                                    <option value="late-coming">
                                        Late Coming
                                    </option>

                                    <option value="early-leave">
                                        Early Leave
                                    </option>

                                    <option value="class-leave">
                                        Class Leave
                                    </option>

                                    <option value="holiday">
                                        Holiday
                                    </option>

                                    <option value="extra-class">
                                        Extra Class
                                    </option>

                                    <option value="exam">
                                        Exam
                                    </option>

                                    <option value="meeting">
                                        Meeting
                                    </option>

                                </select>

                            </div>

                            {/* AUDIENCE */}

                            <div className="admin-notice-field">

                                <label>
                                    Audience
                                </label>

                                <select
                                    name="audienceType"
                                    value={
                                        formData.audienceType
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="all">
                                        Entire School
                                    </option>

                                    <option value="class">
                                        Specific Class
                                    </option>

                                    <option value="student">
                                        Specific Student
                                    </option>

                                    <option value="teachers">
                                        Teachers
                                    </option>

                                </select>

                            </div>

                            {/* CLASS */}

                            {formData.audienceType === "class" && (

                                <div className="admin-notice-field">

                                    <label>
                                        Class
                                    </label>

                                    <select
                                        name="targetClass"
                                        value={
                                            formData.targetClass
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select class
                                        </option>

                                        {[
                                            "Pre-Nursery",
                                            "LKG",
                                            "UKG",
                                            "1",
                                            "2",
                                            "3",
                                            "4",
                                            "5",
                                            "6",
                                            "7",
                                            "8",
                                            "9",
                                            "10"
                                        ].map(
                                            (className) => (

                                                <option
                                                    key={
                                                        className
                                                    }
                                                    value={
                                                        className
                                                    }
                                                >
                                                    Class{" "}
                                                    {
                                                        className
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            )}

                            {/* STUDENT */}

                            {formData.audienceType === "student" && (

                                <div className="admin-notice-field">

                                    <label>
                                        Student
                                    </label>

                                    <select
                                        name="targetStudent"
                                        value={
                                            formData.targetStudent
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select student
                                        </option>

                                        {students.map(
                                            (student) => (

                                                <option
                                                    key={
                                                        student._id
                                                    }
                                                    value={
                                                        student._id
                                                    }
                                                >
                                                    {
                                                        student.name
                                                    }{" "}
                                                    (
                                                    {
                                                        student.studentId
                                                    }
                                                    )
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            )}

                            {/* DATE */}

                            <div className="admin-notice-field">

                                <label>
                                    Event Date
                                </label>

                                <input
                                    type="date"
                                    name="eventDate"
                                    value={
                                        formData.eventDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            {/* TIME */}

                            <div className="admin-notice-field">

                                <label>
                                    Event Time
                                </label>

                                <input
                                    type="text"
                                    name="eventTime"
                                    placeholder="09:30 AM"
                                    value={
                                        formData.eventTime
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            {/* PRIORITY */}

                            <div className="admin-notice-field">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        formData.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="normal">
                                        Normal
                                    </option>

                                    <option value="important">
                                        Important
                                    </option>

                                    <option value="urgent">
                                        Urgent
                                    </option>

                                </select>

                            </div>

                            {/* EXPIRY */}

                            <div className="admin-notice-field">

                                <label>
                                    Expires On
                                </label>

                                <input
                                    type="date"
                                    name="expiresAt"
                                    value={
                                        formData.expiresAt
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            {/* MESSAGE */}

                            <div className="admin-notice-field full">

                                <label>
                                    Message
                                </label>

                                <textarea
                                    name="message"
                                    placeholder="Write the notice message..."
                                    value={
                                        formData.message
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="6"
                                    required
                                />

                            </div>

                            {/* ACTIONS */}

                            <div className="admin-notice-form-actions">

                                <button
                                    type="button"
                                    className="admin-notice-cancel-btn"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-notice-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Publishing..."
                                        : "Publish Notice"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminNotice;