import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Academic.css";

function Academic() {
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/");
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/marks/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setData(response.data);

            } catch (err) {
                console.error("Fetch marks error:", err);

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Unable to load academic information"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMarks();
    }, [navigate]);

    if (loading) {
        return (
            <div className="academic-page">
                <div className="academic-loading">
                    Loading academic information...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="academic-page">
                <div className="academic-error">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="academic-page">

            {/* Header */}
            <div className="academic-header">
                <div>
                    <h1>Academic Performance</h1>
                    <p>View your examination marks and grades</p>
                </div>

                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Student Information */}
            {data?.student && (
                <div className="student-info-card">
                    <div>
                        <span>Student Name</span>
                        <strong>{data.student.name}</strong>
                    </div>

                    <div>
                        <span>Student ID</span>
                        <strong>{data.student.studentId}</strong>
                    </div>

                    <div>
                        <span>Class</span>
                        <strong>{data.student.standard}</strong>
                    </div>

                    <div>
                        <span>Roll Number</span>
                        <strong>{data.student.rollNumber}</strong>
                    </div>
                </div>
            )}

            {/* Summary */}
            {data?.summary && (
                <div className="academic-summary">

                    <div className="summary-card">
                        <span>Total Marks</span>
                        <strong>
                            {data.summary.marksObtained} / {data.summary.totalMarks}
                        </strong>
                    </div>

                    <div className="summary-card">
                        <span>Percentage</span>
                        <strong>
                            {data.summary.percentage}%
                        </strong>
                    </div>

                    <div className="summary-card">
                        <span>Mark Records</span>
                        <strong>
                            {data.summary.totalSubjects}
                        </strong>
                    </div>

                </div>
            )}

            {/* Marks */}
            <div className="marks-section">

                <div className="section-heading">
                    <h2>Subject-wise Performance</h2>
                    <p>Your examination results</p>
                </div>

                {data?.marks?.length > 0 ? (
                    <div className="marks-list">

                        {data.marks.map((mark) => (
                            <div
                                className="mark-card"
                                key={mark._id}
                            >

                                <div className="mark-subject">
                                    <h3>{mark.subject}</h3>
                                    <span>{mark.examType}</span>
                                </div>

                                <div className="mark-score">
                                    <strong>
                                        {mark.marksObtained}
                                    </strong>

                                    <span>
                                        / {mark.totalMarks}
                                    </span>
                                </div>

                                <div className="mark-grade">
                                    <span>Grade</span>
                                    <strong>{mark.grade}</strong>
                                </div>

                            </div>
                        ))}

                    </div>
                ) : (
                    <div className="no-marks">
                        <h3>No marks available</h3>
                        <p>
                            Your marks will appear here once your teacher assigns them.
                        </p>
                    </div>
                )}

            </div>

        </div>
    );
}

export default Academic;