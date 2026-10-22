const Mark = require("../models/mark");
const Student = require("../models/student");
const Teacher = require("../models/Teacher");

// ==========================
// CREATE MARK
// ==========================
const createMark = async (req, res) => {
    try {
        const {
            studentId,
            subject,
            examType,
            marksObtained,
            totalMarks,
            class: className
        } = req.body;

        // Check required fields
        if (
            !studentId ||
            !subject ||
            !examType ||
            marksObtained === undefined ||
            totalMarks === undefined ||
            !className
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate marks
        if (marksObtained < 0 || totalMarks <= 0) {
            return res.status(400).json({
                message: "Invalid marks"
            });
        }

        if (marksObtained > totalMarks) {
            return res.status(400).json({
                message: "Marks obtained cannot be greater than total marks"
            });
        }

        // Check authentication
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Find student
        const student = await Student.findOne({ studentId });

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

        // Check duplicate mark
        const existingMark = await Mark.findOne({
            student: student._id,
            subject,
            examType,
            class: className
        });

        if (existingMark) {
            return res.status(400).json({
                message: "Mark already exists for this student, subject and exam"
            });
        }

        // Create mark
        const mark = await Mark.create({
            student: student._id,
            teacher: teacher._id,
            subject,
            examType,
            marksObtained,
            totalMarks,
            class: className
        });

        res.status(201).json({
            message: "Mark assigned successfully",
            mark
        });

    } catch (error) {
        console.error("Create mark error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ==========================
// GET ALL MARKS
// ==========================
const getMarks = async (req, res) => {
    try {
        const {
            studentId,
            subject,
            examType,
            class: className
        } = req.query;

        const filter = {};

        if (studentId) {
            const student = await Student.findOne({ studentId });

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            filter.student = student._id;
        }

        if (subject) {
            filter.subject = subject;
        }

        if (examType) {
            filter.examType = examType;
        }

        if (className) {
            filter.class = className;
        }

        const marks = await Mark.find(filter)
            .populate("student", "studentId name")
            .populate("teacher", "teacherId name");

        res.status(200).json({
            message: "Marks retrieved successfully",
            count: marks.length,
            marks
        });

    } catch (error) {
        console.error("Get marks error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// GET MARK BY ID
// ==========================
const getMarkById = async (req, res) => {
    try {
        const mark = await Mark.findById(req.params.id)
            .populate("student", "studentId name")
            .populate("teacher", "teacherId name");

        if (!mark) {
            return res.status(404).json({
                message: "Mark not found"
            });
        }

        res.status(200).json({
            message: "Mark retrieved successfully",
            mark
        });

    } catch (error) {
        console.error("Get mark error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// UPDATE MARK
// ==========================
const updateMark = async (req, res) => {
    try {
        const {
            marksObtained,
            totalMarks
        } = req.body;

        if (
            marksObtained === undefined &&
            totalMarks === undefined
        ) {
            return res.status(400).json({
                message: "Provide marksObtained or totalMarks"
            });
        }

        const mark = await Mark.findById(req.params.id);

        if (!mark) {
            return res.status(404).json({
                message: "Mark not found"
            });
        }

        // Check authentication
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const teacher = await Teacher.findOne({
            user: req.user.userId
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher profile not found"
            });
        }

        // Only creator teacher can update
        if (mark.teacher.toString() !== teacher._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized to update this mark"
            });
        }

        if (marksObtained !== undefined) {
            if (marksObtained < 0) {
                return res.status(400).json({
                    message: "Marks obtained cannot be negative"
                });
            }

            mark.marksObtained = marksObtained;
        }

        if (totalMarks !== undefined) {
            if (totalMarks <= 0) {
                return res.status(400).json({
                    message: "Total marks must be greater than zero"
                });
            }

            mark.totalMarks = totalMarks;
        }

        if (mark.marksObtained > mark.totalMarks) {
            return res.status(400).json({
                message: "Marks obtained cannot be greater than total marks"
            });
        }

        await mark.save();

        res.status(200).json({
            message: "Mark updated successfully",
            mark
        });

    } catch (error) {
        console.error("Update mark error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// DELETE MARK
// ==========================
const deleteMark = async (req, res) => {
    try {
        const mark = await Mark.findById(req.params.id);

        if (!mark) {
            return res.status(404).json({
                message: "Mark not found"
            });
        }

        // Check authentication
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const teacher = await Teacher.findOne({
            user: req.user.userId
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher profile not found"
            });
        }

        // Only creator teacher can delete
        if (mark.teacher.toString() !== teacher._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized to delete this mark"
            });
        }

        await mark.deleteOne();

        res.status(200).json({
            message: "Mark deleted successfully"
        });

    } catch (error) {
        console.error("Delete mark error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// Get logged-in student's marks
const getMyMarks = async (req, res) => {
    try {
        // Check authentication
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // Find student linked to logged-in user
        const student = await Student.findOne({
            user: req.user.userId
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        // Find only this student's marks
        const marks = await Mark.find({
            student: student._id
        })
            .populate("teacher", "teacherId name")
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalSubjects = marks.length;

        const totalMarks = marks.reduce(
            (sum, mark) => sum + mark.totalMarks,
            0
        );

        const marksObtained = marks.reduce(
            (sum, mark) => sum + mark.marksObtained,
            0
        );

        const percentage =
            totalMarks === 0
                ? 0
                : ((marksObtained / totalMarks) * 100).toFixed(2);

        res.status(200).json({
            message: "Student marks retrieved successfully",

            student: {
                studentId: student.studentId,
                name: student.name,
                standard: student.standard,
                rollNumber: student.rollNumber
            },

            summary: {
                totalSubjects,
                marksObtained,
                totalMarks,
                percentage: Number(percentage)
            },

            marks
        });

    } catch (error) {
        console.error("Get my marks error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    createMark,
    getMarks,
    getMarkById,
    updateMark,
    deleteMark,
    getMyMarks
};