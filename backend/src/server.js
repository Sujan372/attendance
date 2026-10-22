
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const calendarRoutes =
    require("./routes/calendarRoutes");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();
const markRoutes = require("./routes/markRoutes");
const noticeRoutes =
    require("./routes/noticeRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);   
app.use("/api/marks", markRoutes);
app.use("/api/complaints", complaintRoutes);    
app.use(
    "/api/admin",
    adminRoutes
);  
app.use(
    "/api/notices",
    noticeRoutes
);
app.get("/", (req, res) => {
    res.json({
        message: "School Management API is running"
    });
});
app.use(
    "/api/calendar",
    calendarRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});