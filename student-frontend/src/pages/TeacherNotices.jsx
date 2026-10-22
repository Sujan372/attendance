import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherNotices.css";

function TeacherNotices() {
    const navigate = useNavigate();

    const [teacher, setTeacher] = useState(null);
    const [notices, setNotices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        noticeType: "general",
        targetClass: "",
        targetStudent: "",
        eventDate: "",
        eventTime: "",
        priority: "normal",
        expiresAt: ""
    });

    const [students, setStudents] = useState([]);

    const token = localStorage.getItem("token");

    // ========================================
    // LOAD TEACHER + NOTICES + STUDENTS
    // ========================================

    useEffect(() => {
        loadTeacherData();
    }, []);

    const loadTeacherData = async () => {
        try {
            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setLoading(true);
            setError("");

            const [
                teacherResponse,
                noticesResponse,
                studentsResponse
            ] = await Promise.all([
                axios.get(
                    "http://localhost:5000/api/teachers/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    "http://localhost:5000/api/notices/teacher",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    "http://localhost:5000/api/students",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )
            ]);

            setTeacher(
                teacherResponse.data.teacher
            );

            setNotices(
                noticesResponse.data.notices || []
            );

            setStudents(
                studentsResponse.data.students || []
            );

        } catch (err) {
            console.error(
                "Teacher notices load error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            // Teachers may not be allowed to use
            // the admin student listing endpoint.
            // If that happens, keep notices working.
            if (err.response?.config?.url?.includes(
                "/api/students"
            )) {
                setStudents([]);
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load teacher notices."
                );
            }

        } finally {
            setLoading(false);
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
            targetClass:
                teacher?.assignedClasses?.[0] || "",
            targetStudent: "",
            eventDate: "",
            eventTime: "",
            priority: "normal",
            expiresAt: ""
        });
    };

    const openForm = () => {
        setMessage("");
        setError("");

        setFormData({
            title: "",
            message: "",
            noticeType: "general",
            targetClass:
                teacher?.assignedClasses?.[0] || "",
            targetStudent: "",
            eventDate: "",
            eventTime: "",
            priority: "normal",
            expiresAt: ""
        });

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
            setError(
                "Please enter a notice title."
            );
            return;
        }

        if (!formData.message.trim()) {
            setError(
                "Please enter the notice message."
            );
            return;
        }

        if (!formData.targetClass) {
            setError(
                "Please select a class."
            );
            return;
        }

        try {
            setSaving(true);

            const response = await axios.post(
                "http://localhost:5000/api/notices",
                {
                    title:
                        formData.title.trim(),

                    message:
                        formData.message.trim(),

                    noticeType:
                        formData.noticeType,

                    audienceType:
                        formData.targetStudent
                            ? "student"
                            : "class",

                    targetClass:
                        formData.targetClass,

                    targetStudent:
                        formData.targetStudent || null,

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

            setShowForm(false);

            setFormData({
                title: "",
                message: "",
                noticeType: "general",
                targetClass:
                    teacher?.assignedClasses?.[0] || "",
                targetStudent: "",
                eventDate: "",
                eventTime: "",
                priority: "normal",
                expiresAt: ""
            });

            // Reload notices
            const noticesResponse =
                await axios.get(
                    "http://localhost:5000/api/notices/teacher",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setNotices(
                noticesResponse.data.notices || []
            );

        } catch (err) {
            console.error(
                "Create teacher notice error:",
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
    // FILTER
    // ========================================

    const filteredNotices =
        notices.filter((notice) => {

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

                notice.targetClass
                    ?.toLowerCase()
                    .includes(query)
            );
        });

    // ========================================
    // HELPERS
    // ========================================

    const formatType = (type) => {
        return (type || "general")
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

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="teacher-notices-loading">
                <div className="teacher-notices-loader"></div>
                <p>
                    Loading notices...
                </p>
            </div>
        );
    }

    // ========================================
    // PAGE
    // ========================================

    return (
        <div className="teacher-notices-layout">

            {/* SIDEBAR */}

            <aside className="teacher-notices-sidebar">

                <div className="teacher-notices-brand">

                    <div className="teacher-notices-logo">

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

                <nav className="teacher-notices-nav">

                    <div
                        className="teacher-notices-nav-item"
                        onClick={() =>
                            navigate(
                                "/teacher-dashboard"
                            )
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </div>

                    <div
                        className="teacher-notices-nav-item"
                        onClick={() =>
                            navigate(
                                "/teacher-dashboard"
                            )
                        }
                    >
                        <span>◷</span>
                        Attendance
                    </div>

                    <div
                        className="teacher-notices-nav-item"
                        onClick={() =>
                            navigate(
                                "/teacher-dashboard"
                            )
                        }
                    >
                        <span>▣</span>
                        Marks
                    </div>

                    <div
                        className="teacher-notices-nav-item"
                        onClick={() =>
                            navigate(
                                "/teacher-dashboard"
                            )
                        }
                    >
                        <span>⚑</span>
                        Complaints
                    </div>

                    <div
                        className="teacher-notices-nav-item active"
                    >
                        <span>✉</span>
                        Notices
                    </div>

                </nav>

                <div className="teacher-notices-sidebar-bottom">

                    <div className="teacher-notices-profile-small">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            {teacher?.name ||
                                "Teacher"}
                        </strong>

                    </div>

                    <button
                        className="teacher-notices-logout"
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

            <main className="teacher-notices-main">

                <header className="teacher-notices-topbar">

                    <div>

                        <p>
                            TEACHER PORTAL
                        </p>

                        <h2>
                            Notices & Communication
                        </h2>

                    </div>

                    <div className="teacher-notices-profile">

                        <div className="teacher-notices-profile-text">

                            <strong>
                                {teacher?.name ||
                                    "Teacher"}
                            </strong>

                            <span>
                                Teacher
                            </span>

                        </div>

                        <div className="teacher-notices-avatar">

                            {teacher?.name
                                ?.charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                <div className="teacher-notices-content">

                    {/* HEADING */}

                    <section className="teacher-notices-heading">

                        <div>

                            <span>
                                SCHOOL COMMUNICATION
                            </span>

                            <h1>
                                My Notices
                            </h1>

                            <p>
                                Send announcements to your assigned classes.
                            </p>

                        </div>

                        <button
                            className="teacher-notices-add-btn"
                            onClick={openForm}
                        >
                            + Create Notice
                        </button>

                    </section>

                    {/* ASSIGNED CLASSES */}

                    <section className="teacher-notices-class-card">

                        <div>

                            <span>
                                YOUR ASSIGNED CLASSES
                            </span>

                            <h3>
                                Classes you can notify
                            </h3>

                        </div>

                        <div className="teacher-notices-class-tags">

                            {(
                                teacher?.assignedClasses ||
                                []
                            ).map(
                                className => (
                                    <span
                                        key={className}
                                    >
                                        Class {className}
                                    </span>
                                )
                            )}

                        </div>

                    </section>

                    {/* MESSAGES */}

                    {message && (
                        <div className="teacher-notices-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="teacher-notices-error">
                            {error}
                        </div>
                    )}

                    {/* SEARCH */}

                    <section className="teacher-notices-toolbar">

                        <div className="teacher-notices-search">

                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search your notices..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="teacher-notices-count">
                            {filteredNotices.length} Notices
                        </div>

                    </section>

                    {/* NOTICE LIST */}

                    <section className="teacher-notices-list">

                        {filteredNotices.length === 0 ? (

                            <div className="teacher-notices-empty">

                                <div>
                                    ✉
                                </div>

                                <strong>
                                    No notices found
                                </strong>

                                <p>
                                    Create a notice for one of your assigned classes.
                                </p>

                            </div>

                        ) : (

                            filteredNotices.map(
                                notice => (

                                    <article
                                        className="teacher-notice-card"
                                        key={notice._id}
                                    >

                                        <div className="teacher-notice-card-header">

                                            <div>

                                                <div className="teacher-notice-badges">

                                                    <span className="teacher-notice-type">
                                                        {formatType(
                                                            notice.noticeType
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`teacher-notice-priority ${notice.priority || "normal"}`}
                                                    >
                                                        {
                                                            notice.priority ||
                                                            "normal"
                                                        }
                                                    </span>

                                                </div>

                                                <h3>
                                                    {notice.title}
                                                </h3>

                                            </div>

                                        </div>

                                        <p className="teacher-notice-message">
                                            {notice.message}
                                        </p>

                                        <div className="teacher-notice-meta">

                                            <span>
                                                <strong>
                                                    Audience:
                                                </strong>{" "}
                                                {notice.audienceType ===
                                                "student"
                                                    ? (
                                                        notice.targetStudent?.name ||
                                                        "Student"
                                                    )
                                                    : `Class ${notice.targetClass}`
                                                }
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

                <div className="teacher-notices-modal-overlay">

                    <div className="teacher-notices-modal">

                        <div className="teacher-notices-modal-header">

                            <div>

                                <span>
                                    CLASS COMMUNICATION
                                </span>

                                <h2>
                                    Create Notice
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="teacher-notices-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="teacher-notices-form"
                            onSubmit={createNotice}
                        >

                            {/* TITLE */}

                            <div className="teacher-notices-field full">

                                <label>
                                    Notice Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Late Coming Notice"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* NOTICE TYPE */}

                            <div className="teacher-notices-field">

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

                            {/* CLASS */}

                            <div className="teacher-notices-field">

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

                                    {(
                                        teacher?.assignedClasses ||
                                        []
                                    ).map(
                                        className => (

                                            <option
                                                key={
                                                    className
                                                }
                                                value={
                                                    className
                                                }
                                            >
                                                Class{" "}
                                                {className}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* STUDENT OPTIONAL */}

                            <div className="teacher-notices-field full">

                                <label>
                                    Specific Student (Optional)
                                </label>

                                <select
                                    name="targetStudent"
                                    value={
                                        formData.targetStudent
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Entire selected class
                                    </option>

                                    {students
                                        .filter(
                                            student =>
                                                (
                                                    teacher?.assignedClasses ||
                                                    []
                                                ).map(
                                                    value =>
                                                        String(value)
                                                            .trim()
                                                            .toLowerCase()
                                                ).includes(
                                                    String(
                                                        student.standard
                                                    )
                                                        .trim()
                                                        .toLowerCase()
                                                )
                                        )
                                        .map(
                                            student => (

                                                <option
                                                    key={
                                                        student._id
                                                    }
                                                    value={
                                                        student._id
                                                    }
                                                >
                                                    {student.name}{" "}
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

                            {/* EVENT DATE */}

                            <div className="teacher-notices-field">

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

                            {/* EVENT TIME */}

                            <div className="teacher-notices-field">

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

                            <div className="teacher-notices-field">

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

                            <div className="teacher-notices-field">

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

                            <div className="teacher-notices-field full">

                                <label>
                                    Message
                                </label>

                                <textarea
                                    name="message"
                                    placeholder="Write your class notice..."
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

                            {/* INFO */}

                            <div className="teacher-notices-info">

                                <strong>
                                    Teacher Notice
                                </strong>

                                <p>
                                    You can only send notices to students in your assigned classes.
                                </p>

                            </div>

                            {/* ACTIONS */}

                            <div className="teacher-notices-form-actions">

                                <button
                                    type="button"
                                    className="teacher-notices-cancel-btn"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="teacher-notices-save-btn"
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

export default TeacherNotices;