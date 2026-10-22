const Complaint = require("../models/complaint");
const Student = require("../models/student");
const Teacher = require("../models/Teacher");

// ==========================
// CREATE COMPLAINT
// Teacher/Admin only
// ==========================
const createComplaint = async (req, res) => {
    try {
        const {
            studentId,
            title,
            description
        } = req.body;

        if (!studentId || !title || !description) {
            return res.status(400).json({
                message:
                    "Student ID, title and description are required"
            });
        }

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Find student
        const student = await Student.findOne({
            studentId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Find teacher profile
        const teacher = await Teacher.findOne({
            user: req.user.userId
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher profile not found"
            });
        }

        // Create complaint
        const complaint = await Complaint.create({
            student: student._id,
            teacher: teacher._id,
            title,
            description
        });

        res.status(201).json({
            message: "Complaint created successfully",
            complaint
        });

    } catch (error) {
        console.error(
            "Create complaint error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================
// GET ALL COMPLAINTS
// Teacher/Admin
// ==========================
const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate(
                "student",
                "studentId name"
            )
            .populate(
                "teacher",
                "teacherId name"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message:
                "Complaints retrieved successfully",
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error(
            "Get complaints error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================
// GET LOGGED-IN STUDENT'S COMPLAINTS
// Student only
// ==========================
const getMyComplaints = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Find logged-in student's profile
        const student = await Student.findOne({
            user: req.user.userId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Find complaints belonging to this student
        const complaints = await Complaint.find({
            student: student._id
        })
            .populate(
                "teacher",
                "teacherId name"
            )
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message:
                "Student complaints retrieved successfully",
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error(
            "Get my complaints error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================
// GET COMPLAINT BY ID
// Teacher/Admin
// ==========================
const getComplaintById = async (req, res) => {
    try {
        const complaint =
            await Complaint.findById(
                req.params.id
            )
                .populate(
                    "student",
                    "studentId name"
                )
                .populate(
                    "teacher",
                    "teacherId name"
                );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        res.status(200).json({
            message:
                "Complaint retrieved successfully",
            complaint
        });

    } catch (error) {
        console.error(
            "Get complaint error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================
// UPDATE COMPLAINT
// Admin only
// ==========================
const updateComplaint = async (req, res) => {
    try {
        const {
            status,
            response
        } = req.body;

        const complaint =
            await Complaint.findById(
                req.params.id
            );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        // Update status
        if (status !== undefined) {

            if (
                ![
                    "Pending",
                    "In Progress",
                    "Resolved"
                ].includes(status)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid complaint status"
                });
            }

            complaint.status = status;
        }

        // Update response
        if (response !== undefined) {
            complaint.response = response;
        }

        await complaint.save();

        res.status(200).json({
            message:
                "Complaint updated successfully",
            complaint
        });

    } catch (error) {
        console.error(
            "Update complaint error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================
// DELETE COMPLAINT
// Admin only
// ==========================
const deleteComplaint = async (req, res) => {
    try {
        const complaint =
            await Complaint.findById(
                req.params.id
            );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        await complaint.deleteOne();

        res.status(200).json({
            message:
                "Complaint deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete complaint error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================
// EXPORT
// ==========================
module.exports = {
    createComplaint,
    getComplaints,
    getMyComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint
};