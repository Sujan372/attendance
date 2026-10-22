import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminTeacher.css";

function AdminTeacher() {
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // Edit/Add Teacher
    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [saving, setSaving] = useState(false);

    // Permanent class assignment
    const [classTeacher, setClassTeacher] = useState(null);
    const [classAssignments, setClassAssignments] = useState([]);
    const [savingClasses, setSavingClasses] = useState(false);

    // Teacher substitution
    const [showSubstituteForm, setShowSubstituteForm] = useState(false);
    const [substitutionTeacher, setSubstitutionTeacher] = useState(null);
    const [substitutionData, setSubstitutionData] = useState({
        substituteTeacherId: "",
        className: "",
        date: "",
        reason: "Teacher absent"
    });
    const [savingSubstitution, setSavingSubstitution] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        teacherId: "",
        name: "",
        phone: "",
        email: "",
        subjects: [],
        assignedClasses: []
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
    // LOAD TEACHERS
    // ========================================

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                localStorage.clear();
                navigate("/");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/teachers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setTeachers(
                response.data.teachers || []
            );

        } catch (err) {
            console.error(
                "Fetch teachers error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load teachers."
            );

        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // SEARCH
    // ========================================

    const filteredTeachers = teachers.filter(
        (teacher) => {

            const query =
                search.trim().toLowerCase();

            if (!query) {
                return true;
            }

            return (
                teacher.teacherId
                    ?.toLowerCase()
                    .includes(query) ||

                teacher.name
                    ?.toLowerCase()
                    .includes(query) ||

                teacher.email
                    ?.toLowerCase()
                    .includes(query) ||

                teacher.phone
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
    // CHECKBOX HANDLERS
    // ========================================

    const handleSubjectChange = (subject) => {
        setFormData((previous) => {

            const exists =
                previous.subjects.includes(subject);

            return {
                ...previous,
                subjects: exists
                    ? previous.subjects.filter(
                        item => item !== subject
                    )
                    : [
                        ...previous.subjects,
                        subject
                    ]
            };
        });
    };

    const handleClassChange = (className) => {
        setFormData((previous) => {

            const exists =
                previous.assignedClasses.includes(
                    className
                );

            return {
                ...previous,
                assignedClasses: exists
                    ? previous.assignedClasses.filter(
                        item => item !== className
                    )
                    : [
                        ...previous.assignedClasses,
                        className
                    ]
            };
        });
    };

    // ========================================
    // RESET FORM
    // ========================================

    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            teacherId: "",
            name: "",
            phone: "",
            email: "",
            subjects: [],
            assignedClasses: []
        });
    };

    // ========================================
    // ADD TEACHER
    // ========================================

    const openAddForm = () => {
        setEditingTeacher(null);
        resetForm();

        setMessage("");
        setError("");
        setShowForm(true);
    };

    // ========================================
    // EDIT TEACHER
    // ========================================

    const openEditForm = (teacher) => {
        setEditingTeacher(teacher);

        setFormData({
            username:
                teacher.user?.username || "",

            password: "",

            teacherId:
                teacher.teacherId || "",

            name:
                teacher.name || "",

            phone:
                teacher.phone || "",

            email:
                teacher.email || "",

            subjects:
                Array.isArray(teacher.subjects)
                    ? teacher.subjects
                    : [],

            assignedClasses:
                Array.isArray(
                    teacher.assignedClasses
                )
                    ? teacher.assignedClasses
                    : []
        });

        setMessage("");
        setError("");
        setShowForm(true);
    };

    // ========================================
    // PERMANENT CLASS ASSIGNMENT
    // ========================================

    const openClassAssignment = (teacher) => {
        setClassTeacher(teacher);

        setClassAssignments(
            Array.isArray(teacher.assignedClasses)
                ? teacher.assignedClasses
                : []
        );

        setMessage("");
        setError("");
    };

    const closeClassAssignment = () => {
        if (savingClasses) {
            return;
        }

        setClassTeacher(null);
        setClassAssignments([]);
    };

    const handleAssignedClassChange = (className) => {
        setClassAssignments((previous) => {

            const exists =
                previous.includes(className);

            return exists
                ? previous.filter(
                    item => item !== className
                )
                : [
                    ...previous,
                    className
                ];
        });
    };

    const saveClassAssignments = async () => {
        if (!classTeacher) {
            return;
        }

        if (classAssignments.length === 0) {
            setError(
                "Please assign at least one class."
            );
            return;
        }

        try {
            setSavingClasses(true);
            setMessage("");
            setError("");

            const response = await axios.put(
                `http://localhost:5000/api/teachers/${classTeacher.teacherId}`,
                {
                    assignedClasses:
                        classAssignments
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
                "Class assignments updated successfully."
            );

            setClassTeacher(null);
            setClassAssignments([]);

            await fetchTeachers();

        } catch (err) {
            console.error(
                "Update class assignments error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to update class assignments."
            );

        } finally {
            setSavingClasses(false);
        }
    };

    // ========================================
    // TEACHER SUBSTITUTION
    // ========================================

    const openSubstituteForm = (teacher) => {
        setSubstitutionTeacher(teacher);

        setSubstitutionData({
            substituteTeacherId: "",
            className:
                teacher.assignedClasses?.length > 0
                    ? teacher.assignedClasses[0]
                    : "",
            date: "",
            reason: "Teacher absent"
        });

        setMessage("");
        setError("");
        setShowSubstituteForm(true);
    };

    const closeSubstituteForm = () => {
        if (savingSubstitution) {
            return;
        }

        setShowSubstituteForm(false);
        setSubstitutionTeacher(null);

        setSubstitutionData({
            substituteTeacherId: "",
            className: "",
            date: "",
            reason: "Teacher absent"
        });
    };

    const handleSubstitutionChange = (e) => {
        const { name, value } = e.target;

        setSubstitutionData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const saveSubstitution = async (e) => {
        e.preventDefault();

        if (!substitutionTeacher) {
            return;
        }

        setMessage("");
        setError("");

        if (!substitutionData.substituteTeacherId) {
            setError(
                "Please select a substitute teacher."
            );
            return;
        }

        if (!substitutionData.className) {
            setError(
                "Please select a class."
            );
            return;
        }

        if (!substitutionData.date) {
            setError(
                "Please select a date."
            );
            return;
        }

        if (
            substitutionData.substituteTeacherId ===
            substitutionTeacher.teacherId
        ) {
            setError(
                "Original and substitute teacher must be different."
            );
            return;
        }

        try {
            setSavingSubstitution(true);

            const response = await axios.post(
                "http://localhost:5000/api/substitutions",
                {
                    originalTeacherId:
                        substitutionTeacher.teacherId,

                    substituteTeacherId:
                        substitutionData.substituteTeacherId,

                    className:
                        substitutionData.className,

                    date:
                        substitutionData.date,

                    reason:
                        substitutionData.reason.trim() ||
                        "Teacher absent"
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
                "Substitute teacher assigned successfully."
            );

            closeSubstituteForm();

        } catch (err) {
            console.error(
                "Create substitution error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to assign substitute teacher."
            );

        } finally {
            setSavingSubstitution(false);
        }
    };

    // ========================================
    // CLOSE MAIN FORM
    // ========================================

    const closeForm = () => {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingTeacher(null);
        resetForm();
    };

    // ========================================
    // SAVE TEACHER
    // ========================================

    const saveTeacher = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            localStorage.clear();
            navigate("/");
            return;
        }

        if (!editingTeacher) {
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

        if (
            !formData.teacherId ||
            !formData.name ||
            !formData.phone ||
            !formData.email
        ) {
            setError(
                "Please fill all required teacher fields."
            );
            return;
        }

        if (
            formData.subjects.length === 0
        ) {
            setError(
                "Please select at least one subject."
            );
            return;
        }

        if (
            formData.assignedClasses.length === 0
        ) {
            setError(
                "Please select at least one class."
            );
            return;
        }

        try {
            setSaving(true);

            if (editingTeacher) {

                const response =
                    await axios.put(
                        `http://localhost:5000/api/teachers/${editingTeacher.teacherId}`,
                        {
                            name:
                                formData.name.trim(),

                            phone:
                                formData.phone.trim(),

                            email:
                                formData.email.trim()
                                    .toLowerCase(),

                            subjects:
                                formData.subjects,

                            assignedClasses:
                                formData.assignedClasses
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
                    "Teacher updated successfully."
                );

            } else {

                const response =
                    await axios.post(
                        "http://localhost:5000/api/teachers",
                        {
                            username:
                                formData.username.trim(),

                            password:
                                formData.password,

                            teacherId:
                                formData.teacherId.trim(),

                            name:
                                formData.name.trim(),

                            phone:
                                formData.phone.trim(),

                            email:
                                formData.email.trim()
                                    .toLowerCase(),

                            subjects:
                                formData.subjects,

                            assignedClasses:
                                formData.assignedClasses
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
                    "Teacher account and profile created successfully."
                );
            }

            setShowForm(false);
            setEditingTeacher(null);
            resetForm();

            await fetchTeachers();

        } catch (err) {
            console.error(
                "Save teacher error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to save teacher."
            );

        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // DELETE TEACHER
    // ========================================

    const deleteTeacher = async (teacher) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${teacher.name} (${teacher.teacherId})? This will also delete the linked teacher login account.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response =
                await axios.delete(
                    `http://localhost:5000/api/teachers/${teacher.teacherId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setMessage(
                response.data.message ||
                "Teacher deleted successfully."
            );

            await fetchTeachers();

        } catch (err) {
            console.error(
                "Delete teacher error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to delete teacher."
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
            <div className="admin-teacher-layout">

                <main className="admin-teacher-main">

                    <div className="admin-teacher-loading">

                        <div className="admin-teacher-loader"></div>

                        <p>
                            Loading teachers...
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
        <div className="admin-teacher-layout">

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside className="admin-teacher-sidebar">

                <div className="admin-teacher-brand">

                    <div className="admin-teacher-logo">

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

                <nav className="admin-teacher-nav">

                    <div
                        className="admin-teacher-nav-item"
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
                        className="admin-teacher-nav-item"
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
                        className="admin-teacher-nav-item active"
                    >
                        <span>◉</span>
                        Teachers
                    </div>

                    <div
                        className="admin-teacher-nav-item"
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
                        className="admin-teacher-nav-item"
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
                        className="admin-teacher-nav-item"
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

                <div className="admin-teacher-sidebar-bottom">

                    <div className="admin-teacher-role">

                        <span>
                            Signed in as
                        </span>

                        <strong>
                            Administrator
                        </strong>

                    </div>

                    <button
                        className="admin-teacher-logout"
                        onClick={logout}
                    >
                        ↪ &nbsp; Logout
                    </button>

                </div>

            </aside>

            {/* ========================================
                MAIN
            ======================================== */}

            <main className="admin-teacher-main">

                <header className="admin-teacher-topbar">

                    <div>

                        <p>
                            ADMIN PORTAL
                        </p>

                        <h2>
                            Teachers
                        </h2>

                    </div>

                    <div className="admin-teacher-profile">

                        <div className="admin-teacher-profile-text">

                            <strong>
                                {adminName}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <div className="admin-teacher-avatar">

                            {adminName
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                    </div>

                </header>

                <div className="admin-teacher-content">

                    {/* PAGE HEADING */}

                    <section className="admin-teacher-heading">

                        <div>

                            <span>
                                TEACHER MANAGEMENT
                            </span>

                            <h1>
                                Teacher Records
                            </h1>

                            <p>
                                Manage teacher accounts,
                                subjects, classes and substitutions.
                            </p>

                        </div>

                        <button
                            className="admin-teacher-add-btn"
                            onClick={openAddForm}
                        >
                            + Add Teacher
                        </button>

                    </section>

                    {/* MESSAGES */}

                    {message && (
                        <div className="admin-teacher-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="admin-teacher-error">
                            {error}
                        </div>
                    )}

                    {/* SEARCH */}

                    <section className="admin-teacher-toolbar">

                        <div className="admin-teacher-search">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search by teacher ID, name, email..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="admin-teacher-count">
                            {filteredTeachers.length} Teachers
                        </div>

                    </section>

                    {/* TABLE */}

                    <section className="admin-teacher-card">

                        <div className="admin-teacher-table-wrapper">

                            <table className="admin-teacher-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Teacher
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Subjects
                                        </th>

                                        <th>
                                            Classes
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredTeachers.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="admin-teacher-empty"
                                            >
                                                No teachers found.
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredTeachers.map(
                                            (teacher) => (

                                                <tr
                                                    key={
                                                        teacher._id
                                                    }
                                                >

                                                    <td>

                                                        <div className="admin-teacher-name">

                                                            <div className="admin-teacher-staff-avatar">

                                                                {teacher.name
                                                                    ?.charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}

                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        teacher.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        teacher.teacherId
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td>
                                                        {
                                                            teacher.phone
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            teacher.email
                                                        }
                                                    </td>

                                                    <td>

                                                        <div className="admin-teacher-tags">

                                                            {(
                                                                teacher.subjects ||
                                                                []
                                                            ).map(
                                                                (
                                                                    subject,
                                                                    index
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {
                                                                            subject
                                                                        }
                                                                    </span>

                                                                )
                                                            )}

                                                        </div>

                                                    </td>

                                                    <td>

                                                        <div className="admin-teacher-tags">

                                                            {(
                                                                teacher.assignedClasses ||
                                                                []
                                                            ).map(
                                                                (
                                                                    className,
                                                                    index
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        Class{" "}
                                                                        {
                                                                            className
                                                                        }
                                                                    </span>

                                                                )
                                                            )}

                                                        </div>

                                                    </td>

                                                    <td>

                                                        <div className="admin-teacher-actions">

                                                            <button
                                                                className="admin-teacher-edit-btn"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        teacher
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="admin-teacher-class-btn"
                                                                onClick={() =>
                                                                    openClassAssignment(
                                                                        teacher
                                                                    )
                                                                }
                                                            >
                                                                Classes
                                                            </button>

                                                            <button
                                                                className="admin-teacher-substitute-btn"
                                                                onClick={() =>
                                                                    openSubstituteForm(
                                                                        teacher
                                                                    )
                                                                }
                                                            >
                                                                Substitute
                                                            </button>

                                                            <button
                                                                className="admin-teacher-delete-btn"
                                                                onClick={() =>
                                                                    deleteTeacher(
                                                                        teacher
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
                ADD / EDIT TEACHER MODAL
            ======================================== */}

            {showForm && (

                <div className="admin-teacher-modal-overlay">

                    <div className="admin-teacher-modal">

                        <div className="admin-teacher-modal-header">

                            <div>

                                <span>
                                    {editingTeacher
                                        ? "EDIT RECORD"
                                        : "NEW RECORD"}
                                </span>

                                <h2>
                                    {editingTeacher
                                        ? "Edit Teacher"
                                        : "Add Teacher"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-teacher-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={saveTeacher}
                            className="admin-teacher-form"
                        >

                            {/* LOGIN */}

                            {!editingTeacher && (
                                <>
                                    <div className="admin-teacher-form-field">

                                        <label>
                                            Username
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="teacher.math"
                                            value={
                                                formData.username
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                    <div className="admin-teacher-form-field">

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

                            {/* TEACHER ID */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Teacher ID
                                </label>

                                <input
                                    type="text"
                                    name="teacherId"
                                    placeholder="T001"
                                    value={
                                        formData.teacherId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        Boolean(editingTeacher)
                                    }
                                    required
                                />

                            </div>

                            {/* NAME */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Teacher Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Teacher name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* PHONE */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Phone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone number"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* EMAIL */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="teacher@school.com"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* SUBJECTS */}

                            <div className="admin-teacher-form-section">

                                <label>
                                    Subjects
                                </label>

                                <div className="admin-teacher-check-grid">

                                    {[
                                        "English",
                                        "Kannada",
                                        "Hindi",
                                        "Mathematics",
                                        "Science",
                                        "Social Science",
                                        "Computer",
                                        "Physical Education"
                                    ].map(
                                        (subject) => (

                                            <label
                                                className="admin-teacher-check-item"
                                                key={subject}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.subjects.includes(
                                                            subject
                                                        )
                                                    }
                                                    onChange={() =>
                                                        handleSubjectChange(
                                                            subject
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {subject}
                                                </span>

                                            </label>

                                        )
                                    )}

                                </div>

                            </div>

                            {/* CLASSES */}

                            <div className="admin-teacher-form-section">

                                <label>
                                    Assigned Classes
                                </label>

                                <div className="admin-teacher-check-grid classes">

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

                                            <label
                                                className="admin-teacher-check-item"
                                                key={className}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        formData.assignedClasses.includes(
                                                            className
                                                        )
                                                    }
                                                    onChange={() =>
                                                        handleClassChange(
                                                            className
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {className}
                                                </span>

                                            </label>

                                        )
                                    )}

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="admin-teacher-form-actions">

                                <button
                                    type="button"
                                    className="admin-teacher-cancel-btn"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-teacher-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingTeacher
                                            ? "Update Teacher"
                                            : "Create Teacher"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* ========================================
                PERMANENT CLASS ASSIGNMENT MODAL
            ======================================== */}

            {classTeacher && (

                <div className="admin-teacher-modal-overlay">

                    <div className="admin-teacher-modal">

                        <div className="admin-teacher-modal-header">

                            <div>

                                <span>
                                    CLASS MANAGEMENT
                                </span>

                                <h2>
                                    Assign Classes
                                </h2>

                                <p>
                                    {classTeacher.name} ·{" "}
                                    {classTeacher.teacherId}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="admin-teacher-close"
                                onClick={closeClassAssignment}
                                disabled={savingClasses}
                            >
                                ×
                            </button>

                        </div>

                        <div className="admin-teacher-form">

                            <div className="admin-teacher-form-section">

                                <label>
                                    Assigned Classes
                                </label>

                                <div className="admin-teacher-check-grid classes">

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

                                            <label
                                                className="admin-teacher-check-item"
                                                key={className}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        classAssignments.includes(
                                                            className
                                                        )
                                                    }
                                                    onChange={() =>
                                                        handleAssignedClassChange(
                                                            className
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {className}
                                                </span>

                                            </label>

                                        )
                                    )}

                                </div>

                            </div>

                            <div className="admin-teacher-form-actions">

                                <button
                                    type="button"
                                    className="admin-teacher-cancel-btn"
                                    onClick={closeClassAssignment}
                                    disabled={savingClasses}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="admin-teacher-save-btn"
                                    onClick={saveClassAssignments}
                                    disabled={savingClasses}
                                >
                                    {savingClasses
                                        ? "Saving..."
                                        : "Save Classes"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {/* ========================================
                SUBSTITUTE TEACHER MODAL
            ======================================== */}

            {showSubstituteForm && substitutionTeacher && (

                <div className="admin-teacher-modal-overlay">

                    <div className="admin-teacher-modal">

                        <div className="admin-teacher-modal-header">

                            <div>

                                <span>
                                    SUBSTITUTE MANAGEMENT
                                </span>

                                <h2>
                                    Assign Substitute Teacher
                                </h2>

                                <p>
                                    Temporary class assignment
                                </p>

                            </div>

                            <button
                                type="button"
                                className="admin-teacher-close"
                                onClick={closeSubstituteForm}
                                disabled={
                                    savingSubstitution
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                saveSubstitution
                            }
                            className="admin-teacher-form"
                        >

                            {/* ABSENT TEACHER */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Absent Teacher
                                </label>

                                <input
                                    type="text"
                                    value={
                                        `${substitutionTeacher.name} (${substitutionTeacher.teacherId})`
                                    }
                                    disabled
                                />

                            </div>

                            {/* SUBSTITUTE TEACHER */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Substitute Teacher
                                </label>

                                <select
                                    name="substituteTeacherId"
                                    value={
                                        substitutionData.substituteTeacherId
                                    }
                                    onChange={
                                        handleSubstitutionChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select substitute teacher
                                    </option>

                                    {teachers
                                        .filter(
                                            teacher =>
                                                teacher.teacherId !==
                                                substitutionTeacher.teacherId
                                        )
                                        .map(
                                            teacher => (

                                                <option
                                                    key={
                                                        teacher.teacherId
                                                    }
                                                    value={
                                                        teacher.teacherId
                                                    }
                                                >
                                                    {teacher.name}{" "}
                                                    ({teacher.teacherId})
                                                </option>

                                            )
                                        )}

                                </select>

                            </div>

                            {/* CLASS */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Class
                                </label>

                                <select
                                    name="className"
                                    value={
                                        substitutionData.className
                                    }
                                    onChange={
                                        handleSubstitutionChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select class
                                    </option>

                                    {(
                                        substitutionTeacher.assignedClasses ||
                                        []
                                    ).map(
                                        className => (

                                            <option
                                                key={className}
                                                value={className}
                                            >
                                                Class {className}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* DATE */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Date
                                </label>

                                <input
                                    type="date"
                                    name="date"
                                    value={
                                        substitutionData.date
                                    }
                                    onChange={
                                        handleSubstitutionChange
                                    }
                                    required
                                />

                            </div>

                            {/* REASON */}

                            <div className="admin-teacher-form-field">

                                <label>
                                    Reason
                                </label>

                                <input
                                    type="text"
                                    name="reason"
                                    placeholder="Teacher absent"
                                    value={
                                        substitutionData.reason
                                    }
                                    onChange={
                                        handleSubstitutionChange
                                    }
                                />

                            </div>

                            {/* INFORMATION */}

                            <div className="admin-teacher-substitute-info">

                                <strong>
                                    Temporary Assignment
                                </strong>

                                <p>
                                    This will not change the teacher's permanent assigned classes.
                                </p>

                            </div>

                            {/* ACTIONS */}

                            <div className="admin-teacher-form-actions">

                                <button
                                    type="button"
                                    className="admin-teacher-cancel-btn"
                                    onClick={
                                        closeSubstituteForm
                                    }
                                    disabled={
                                        savingSubstitution
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-teacher-save-btn"
                                    disabled={
                                        savingSubstitution
                                    }
                                >
                                    {savingSubstitution
                                        ? "Assigning..."
                                        : "Assign Substitute"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminTeacher;