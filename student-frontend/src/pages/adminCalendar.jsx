import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminCalendar.css";

function AdminCalendar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [currentMonth, setCurrentMonth] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    );
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        eventType: "school-event",
        audienceType: "all",
        targetClass: "",
        startDate: "",
        endDate: "",
        eventTime: "",
        location: ""
    });

    const fetchEvents = async () => {
        if (!token) {
            navigate("/");
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:5000/api/calendar",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEvents(response.data.events || []);
            setError("");
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            setError(err.response?.data?.message || "Failed to load calendar events.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            eventType: "school-event",
            audienceType: "all",
            targetClass: "",
            startDate: "",
            endDate: "",
            eventTime: "",
            location: ""
        });
    };

    const openCreate = () => {
        setEditingEvent(null);
        resetForm();
        setMessage("");
        setError("");
        setShowModal(true);
    };

    const openEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title || "",
            description: event.description || "",
            eventType: event.eventType || "school-event",
            audienceType: event.audienceType || "all",
            targetClass: event.targetClass || "",
            startDate: event.startDate?.slice(0, 10) || "",
            endDate: event.endDate?.slice(0, 10) || "",
            eventTime: event.eventTime || "",
            location: event.location || ""
        });
        setMessage("");
        setError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditingEvent(null);
        resetForm();
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const saveEvent = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!formData.title || !formData.eventType || !formData.audienceType || !formData.startDate) {
            setError("Title, event type, audience and start date are required.");
            return;
        }
        if (formData.audienceType === "class" && !formData.targetClass) {
            setError("Please select a target class.");
            return;
        }
        if (formData.endDate && formData.endDate < formData.startDate) {
            setError("End date cannot be before start date.");
            return;
        }

        const payload = {
            ...formData,
            targetClass: formData.audienceType === "class" ? formData.targetClass : null,
            endDate: formData.endDate || null,
            eventTime: formData.eventTime || null,
            location: formData.location || null
        };

        try {
            setSaving(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            };

            if (editingEvent) {
                await axios.put(
                    `http://localhost:5000/api/calendar/${editingEvent._id}`,
                    payload,
                    config
                );
                setMessage("Calendar event updated successfully.");
            } else {
                await axios.post(
                    "http://localhost:5000/api/calendar",
                    payload,
                    config
                );
                setMessage("Calendar event created successfully.");
            }

            closeModal();
            await fetchEvents();
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            setError(err.response?.data?.message || "Failed to save calendar event.");
        } finally {
            setSaving(false);
        }
    };

    const deleteEvent = async (event) => {
        if (!window.confirm(`Delete "${event.title}"?`)) return;
        try {
            setError("");
            setMessage("");
            await axios.delete(
                `http://localhost:5000/api/calendar/${event._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("Calendar event deleted successfully.");
            closeModal();
            await fetchEvents();
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate("/");
                return;
            }
            setError(err.response?.data?.message || "Failed to delete calendar event.");
        }
    };

    const days = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const offset = (new Date(year, month, 1).getDay() + 6) % 7;
        const total = new Date(year, month + 1, 0).getDate();
        const cells = Math.ceil((offset + total) / 7) * 7;
        return Array.from({ length: cells }, (_, i) =>
            i < offset || i >= offset + total
                ? null
                : new Date(year, month, i - offset + 1)
        );
    }, [currentMonth]);

    const dateKey = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const eventsOn = (date) => {
        if (!date) return [];
        const key = dateKey(date);
        return events.filter((event) => {
            const start = event.startDate?.slice(0, 10);
            const end = event.endDate?.slice(0, 10) || start;
            return key >= start && key <= end;
        });
    };

    const formatDate = (value) => {
        if (!value) return "—";
        const [y, m, d] = value.slice(0, 10).split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
        });
    };

    const eventTypeLabel = {
        holiday: "Holiday",
        exam: "Exam",
        meeting: "Meeting",
        "school-event": "School Event",
        "extra-class": "Extra Class",
        activity: "Activity",
        general: "General"
    };

    const audienceLabel = (event) =>
        event.audienceType === "class"
            ? `Class ${event.targetClass}`
            : event.audienceType === "teachers"
                ? "Teachers"
                : event.audienceType === "students"
                    ? "Students"
                    : "Everyone";

    const upcoming = [...events]
        .filter((event) => event.startDate?.slice(0, 10) >= dateKey(new Date()))
        .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))
        .slice(0, 8);

    if (loading) {
        return <div className="admin-calendar-loading"><div className="admin-calendar-loader" /><p>Loading school calendar...</p></div>;
    }

    return (
        <div className="admin-calendar-layout">
            <aside className="admin-calendar-sidebar">
                <div className="admin-calendar-brand">
                    <div className="admin-calendar-logo"><img src="/school_logo.jpeg" alt="Priyadharshinie Public School" /></div>
                    <div><h2>Priyadharshinie</h2><span>Public School</span></div>
                </div>

                <nav className="admin-calendar-nav">
                    <div className="admin-calendar-nav-item" onClick={() => navigate("/admin-dashboard")}><span>⌂</span>Dashboard</div>
                    <div className="admin-calendar-nav-item" onClick={() => navigate("/admin/students")}><span>👤</span>Students</div>
                    <div className="admin-calendar-nav-item" onClick={() => navigate("/admin/teachers")}><span>◉</span>Teachers</div>
                    <div className="admin-calendar-nav-item" onClick={() => navigate("/admin/attendance")}><span>◷</span>Attendance</div>
                    <div className="admin-calendar-nav-item" onClick={() => navigate("/admin/marks")}><span>▣</span>Marks</div>
                    <div className="admin-calendar-nav-item" onClick={() => navigate("/admin/complaints")}><span>⚑</span>Complaints</div>
                    <div className="admin-calendar-nav-item" onClick={() => navigate("/admin/notices")}><span>✉</span>Notices</div>
                    <div className="admin-calendar-nav-item active"><span>▦</span>Calendar</div>
                </nav>

                <div className="admin-calendar-sidebar-bottom">
                    <div className="admin-calendar-role"><span>Signed in as</span><strong>Administrator</strong></div>
                    <button className="admin-calendar-logout" onClick={() => { localStorage.clear(); navigate("/"); }}>↪ &nbsp; Logout</button>
                </div>
            </aside>

            <main className="admin-calendar-main">
                <header className="admin-calendar-topbar">
                    <div><p>ADMIN PORTAL</p><h1>School Calendar</h1></div>
                    <button className="admin-calendar-add-btn" onClick={openCreate}>+ Add Event</button>
                </header>

                {message && <div className="admin-calendar-success">{message}</div>}
                {error && <div className="admin-calendar-error">{error}</div>}

                <div className="admin-calendar-content">
                    <section className="admin-calendar-card">
                        <div className="admin-calendar-header">
                            <div><span>SCHOOL SCHEDULE</span><h2>{currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h2></div>
                            <div className="admin-calendar-controls">
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>‹</button>
                                <button className="today-btn" onClick={() => { const d = new Date(); setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</button>
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>›</button>
                            </div>
                        </div>

                        <div className="calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}</div>
                        <div className="calendar-grid">
                            {days.map((date, index) => {
                                const dayEvents = eventsOn(date);
                                const today = date && dateKey(date) === dateKey(new Date());
                                return <div key={index} className={date ? "calendar-day" : "calendar-day empty"}>
                                    {date && <>
                                        <div className={today ? "calendar-day-number today" : "calendar-day-number"}>{date.getDate()}</div>
                                        <div className="calendar-events">
                                            {dayEvents.slice(0, 3).map((event) => <button key={event._id} className={`calendar-event ${event.eventType}`} onClick={() => openEdit(event)}>{event.title}</button>)}
                                            {dayEvents.length > 3 && <span className="more-events">+{dayEvents.length - 3} more</span>}
                                        </div>
                                    </>}
                                </div>;
                            })}
                        </div>
                    </section>

                    <aside className="admin-upcoming-card">
                        <div className="admin-upcoming-header"><div><span>UPCOMING</span><h2>Events</h2></div><span className="event-count">{events.length}</span></div>
                        {upcoming.length === 0 ? <div className="admin-calendar-empty">No upcoming events.</div> :
                            <div className="upcoming-event-list">
                                {upcoming.map((event) => <button key={event._id} className="upcoming-event" onClick={() => openEdit(event)}>
                                    <div className="upcoming-date"><strong>{formatDate(event.startDate)}</strong>{event.eventTime && <span>{event.eventTime}</span>}</div>
                                    <div className="upcoming-details"><strong>{event.title}</strong><span>{eventTypeLabel[event.eventType] || event.eventType} • {audienceLabel(event)}</span>{event.location && <small>📍 {event.location}</small>}</div>
                                </button>)}
                            </div>
                        }
                    </aside>
                </div>
            </main>

            {showModal && <div className="admin-calendar-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
                <div className="admin-calendar-modal">
                    <div className="admin-calendar-modal-header"><div><span>{editingEvent ? "EDIT EVENT" : "NEW EVENT"}</span><h2>{editingEvent ? "Edit Calendar Event" : "Add Calendar Event"}</h2></div><button className="modal-close" onClick={closeModal}>×</button></div>
                    <form className="admin-calendar-form" onSubmit={saveEvent}>
                        <div className="calendar-form-group full"><label>Event Title</label><input name="title" value={formData.title} onChange={handleChange} placeholder="Annual Sports Day" /></div>
                        <div className="calendar-form-group"><label>Event Type</label><select name="eventType" value={formData.eventType} onChange={handleChange}><option value="holiday">Holiday</option><option value="exam">Exam</option><option value="meeting">Meeting</option><option value="school-event">School Event</option><option value="extra-class">Extra Class</option><option value="activity">Activity</option><option value="general">General</option></select></div>
                        <div className="calendar-form-group"><label>Audience</label><select name="audienceType" value={formData.audienceType} onChange={handleChange}><option value="all">Everyone</option><option value="class">Specific Class</option><option value="students">Students</option><option value="teachers">Teachers</option></select></div>
                        {formData.audienceType === "class" && <div className="calendar-form-group"><label>Target Class</label><input name="targetClass" value={formData.targetClass} onChange={handleChange} placeholder="10" /></div>}
                        <div className="calendar-form-group"><label>Start Date</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} /></div>
                        <div className="calendar-form-group"><label>End Date</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} /></div>
                        <div className="calendar-form-group"><label>Time</label><input name="eventTime" value={formData.eventTime} onChange={handleChange} placeholder="10:00 AM" /></div>
                        <div className="calendar-form-group"><label>Location</label><input name="location" value={formData.location} onChange={handleChange} placeholder="School Auditorium" /></div>
                        <div className="calendar-form-group full"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Add event details..." rows="4" /></div>
                        {error && <div className="calendar-modal-error">{error}</div>}
                        <div className="calendar-form-footer">
                            {editingEvent && <button type="button" className="calendar-delete-btn" disabled={saving} onClick={() => deleteEvent(editingEvent)}>Delete</button>}
                            <div className="calendar-form-actions"><button type="button" className="calendar-cancel-btn" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="calendar-save-btn" disabled={saving}>{saving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}</button></div>
                        </div>
                    </form>
                </div>
            </div>}
        </div>
    );
}

export default AdminCalendar;
