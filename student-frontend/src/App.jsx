import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Attendance from "./pages/attendance";
import Academic from "./pages/academic";

import AdminDashboard from "./pages/adminDashboard";
import AdminStudents from "./pages/adminStudent";
import AdminTeacher from "./pages/adminTeacher";
import AdminAttendance from "./pages/adminAttendance";
import AdminMarks from "./pages/adminMarks";
import AdminComplaints from "./pages/adminComplaints";
import AdminNotice from "./pages/adminNotice";
import AdminCalendar from "./pages/adminCalendar";

import TeacherNotices from "./pages/TeacherNotices";
import StudentNotices from "./pages/studentNotice";


function App() {

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    // ========================================
    // GET USER DASHBOARD
    // ========================================

    const getDashboard = () => {

        if (!token || !user) {
            return "/";
        }

        if (user.role === "student") {
            return "/dashboard";
        }

        if (user.role === "teacher") {
            return "/teacher-dashboard";
        }

        if (user.role === "admin") {
            return "/admin-dashboard";
        }

        return "/";
    };


    return (
        <BrowserRouter>

            <Routes>

                {/* ========================================
                    LOGIN
                ======================================== */}

                <Route
                    path="/"
                    element={
                        token && user ? (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        ) : (
                            <Login />
                        )
                    }
                />


                {/* ========================================
                    STUDENT DASHBOARD
                ======================================== */}

                <Route
                    path="/dashboard"
                    element={
                        token &&
                        user?.role === "student" ? (
                            <StudentDashboard />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    STUDENT ATTENDANCE
                ======================================== */}

                <Route
                    path="/attendance"
                    element={
                        token &&
                        user?.role === "student" ? (
                            <Attendance />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    STUDENT ACADEMIC
                ======================================== */}

                <Route
                    path="/academic"
                    element={
                        token &&
                        user?.role === "student" ? (
                            <Academic />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    STUDENT NOTICES
                ======================================== */}

                <Route
                    path="/notices"
                    element={
                        token &&
                        user?.role === "student" ? (
                            <StudentNotices />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    TEACHER DASHBOARD
                ======================================== */}

                <Route
                    path="/teacher-dashboard"
                    element={
                        token &&
                        user?.role === "teacher" ? (
                            <TeacherDashboard />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    TEACHER NOTICES
                ======================================== */}

                <Route
                    path="/teacher/notices"
                    element={
                        token &&
                        user?.role === "teacher" ? (
                            <TeacherNotices />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN DASHBOARD
                ======================================== */}

                <Route
                    path="/admin-dashboard"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminDashboard />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN STUDENTS
                ======================================== */}

                <Route
                    path="/admin/students"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminStudents />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN TEACHERS
                ======================================== */}

                <Route
                    path="/admin/teachers"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminTeacher />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN ATTENDANCE
                ======================================== */}

                <Route
                    path="/admin/attendance"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminAttendance />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN MARKS
                ======================================== */}

                <Route
                    path="/admin/marks"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminMarks />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN COMPLAINTS
                ======================================== */}

                <Route
                    path="/admin/complaints"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminComplaints />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN NOTICES
                ======================================== */}

                <Route
                    path="/admin/notices"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminNotice />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    ADMIN CALENDAR
                ======================================== */}

                <Route
                    path="/admin/calendar"
                    element={
                        token &&
                        user?.role === "admin" ? (
                            <AdminCalendar />
                        ) : (
                            <Navigate
                                to={getDashboard()}
                                replace
                            />
                        )
                    }
                />


                {/* ========================================
                    UNKNOWN URL
                ======================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={getDashboard()}
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;