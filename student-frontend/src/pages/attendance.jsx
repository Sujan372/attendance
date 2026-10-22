import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Attendance.css";

function Attendance() {

    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [studentId, setStudentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchAttendance = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/");
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/attendance/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setAttendance(
                    response.data.attendance || []
                );

                if (response.data.student?.studentId) {
                    setStudentId(
                        response.data.student.studentId
                    );
                }

            } catch (error) {

                console.error(
                    "Attendance error:",
                    error
                );

                if (error.response?.status === 401) {

                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    navigate("/");
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Failed to load attendance"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchAttendance();

    }, [navigate]);


    if (loading) {
        return (
            <div className="attendance-loading">
                <div className="attendance-loader"></div>
                <p>Loading attendance...</p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="attendance-error">
                <h2>{error}</h2>

                <button
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }


    const totalDays = attendance.length;

    const presentDays = attendance.filter(
        record =>
            record.status?.toLowerCase() === "present"
    ).length;

    const absentDays = attendance.filter(
        record =>
            record.status?.toLowerCase() === "absent"
    ).length;

    const percentage =
        totalDays === 0
            ? 0
            : ((presentDays / totalDays) * 100).toFixed(2);


    return (
        <div className="attendance-page">

            <div className="attendance-header">

                <div>
                    <span>STUDENT PORTAL</span>

                    <h1>Attendance</h1>

                    <p>
                        Student ID:{" "}
                        <strong>{studentId}</strong>
                    </p>
                </div>

                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

            </div>


            <div className="attendance-summary">

                <div className="attendance-summary-card">
                    <span>Attendance</span>
                    <strong>{percentage}%</strong>
                </div>

                <div className="attendance-summary-card">
                    <span>Present</span>
                    <strong>{presentDays}</strong>
                </div>

                <div className="attendance-summary-card">
                    <span>Absent</span>
                    <strong>{absentDays}</strong>
                </div>

                <div className="attendance-summary-card">
                    <span>Total Days</span>
                    <strong>{totalDays}</strong>
                </div>

            </div>


            <div className="attendance-table-card">

                <div className="table-header">

                    <div>
                        <span>ATTENDANCE RECORD</span>
                        <h2>Daily Attendance</h2>
                    </div>

                </div>


                {attendance.length === 0 ? (

                    <div className="attendance-empty">

                        <h3>No attendance records</h3>

                        <p>
                            Attendance records will appear here
                            once they are marked.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Marked By</th>
                                </tr>
                            </thead>

                            <tbody>

                                {attendance.map(record => {

                                    const date =
                                        new Date(record.date);

                                    return (
                                        <tr key={record._id}>

                                            <td>
                                                {date.toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        record.status
                                                            ?.toLowerCase() ===
                                                        "present"
                                                            ? "status-present"
                                                            : "status-absent"
                                                    }
                                                >
                                                    {record.status}
                                                </span>
                                            </td>

                                            <td>
                                                {record.markedBy?.username ||
                                                    "Teacher"}
                                            </td>

                                        </tr>
                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Attendance;