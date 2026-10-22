const Teacher = require("../models/Teacher");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ========================================
// CREATE TEACHER + USER ACCOUNT
// Admin only
// ========================================

const createTeacher = async (req, res) => {
    try {
        const {
            username,
            password,
            teacherId,
            name,
            phone,
            email,
            subjects,
            assignedClasses
        } = req.body;

        // ========================================
        // VALIDATE REQUIRED FIELDS
        // ========================================

        if (
            !username ||
            !password ||
            !teacherId ||
            !name ||
            !phone ||
            !email
        ) {
            return res.status(400).json({
                message:
                    "Username, password and all required teacher fields are required"
            });
        }

        // ========================================
        // NORMALIZE DATA
        // ========================================

        const cleanUsername = username.trim();
        const cleanTeacherId = teacherId.trim();
        const cleanName = name.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim().toLowerCase();

        // ========================================
        // CHECK USERNAME
        // ========================================

        const existingUser = await User.findOne({
            username: cleanUsername
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        // ========================================
        // CHECK TEACHER ID / EMAIL
        // ========================================

        const existingTeacher = await Teacher.findOne({
            $or: [
                { teacherId: cleanTeacherId },
                { email: cleanEmail }
            ]
        });

        if (existingTeacher) {
            return res.status(400).json({
                message:
                    "Teacher ID or email already exists"
            });
        }

        // ========================================
        // HASH PASSWORD
        // ========================================

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // ========================================
        // CREATE USER
        // ========================================

        const user = await User.create({
            username: cleanUsername,
            password: hashedPassword,
            role: "teacher",
            isVerified: true
        });

        try {
            // ========================================
            // CREATE TEACHER
            // ========================================

            const teacher = await Teacher.create({
                teacherId: cleanTeacherId,
                name: cleanName,
                phone: cleanPhone,
                email: cleanEmail,

                subjects: Array.isArray(subjects)
                    ? subjects
                    : [],

                assignedClasses:
                    Array.isArray(assignedClasses)
                        ? assignedClasses
                        : [],

                user: user._id
            });

            return res.status(201).json({
                message:
                    "Teacher account and profile created successfully",

                teacher: {
                    id: teacher._id,
                    teacherId: teacher.teacherId,
                    name: teacher.name,
                    phone: teacher.phone,
                    email: teacher.email,
                    subjects: teacher.subjects,
                    assignedClasses:
                        teacher.assignedClasses
                },

                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    isVerified: user.isVerified
                }
            });

        } catch (teacherError) {

            // ========================================
            // ROLLBACK USER
            // ========================================

            await User.findByIdAndDelete(
                user._id
            );

            throw teacherError;
        }

    } catch (error) {

        console.error(
            "Create teacher error:",
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Username, teacher ID or email already exists"
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET ALL TEACHERS
// ========================================

const getAllTeachers = async (req, res) => {
    try {

        const teachers =
            await Teacher.find()
                .populate(
                    "user",
                    "username role isVerified"
                )
                .sort({
                    name: 1
                });

        return res.status(200).json({
            message:
                "Teachers retrieved successfully",

            count:
                teachers.length,

            teachers
        });

    } catch (error) {

        console.error(
            "Get all teachers error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET TEACHER BY TEACHER ID
// ========================================

const getTeacherById = async (req, res) => {
    try {

        const { teacherId } = req.params;

        const teacher =
            await Teacher.findOne({
                teacherId
            }).populate(
                "user",
                "username role isVerified"
            );

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        return res.status(200).json({
            message:
                "Teacher retrieved successfully",

            teacher
        });

    } catch (error) {

        console.error(
            "Get teacher error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// UPDATE TEACHER
// ========================================

const updateTeacher = async (req, res) => {
    try {

        const { teacherId } = req.params;

        const {
            name,
            phone,
            email,
            subjects,
            assignedClasses
        } = req.body;

        const updateData = {};

        if (name !== undefined) {
            updateData.name =
                name.trim();
        }

        if (phone !== undefined) {
            updateData.phone =
                phone.trim();
        }

        if (email !== undefined) {
            updateData.email =
                email.trim().toLowerCase();
        }

        if (subjects !== undefined) {
            updateData.subjects =
                Array.isArray(subjects)
                    ? subjects
                    : [];
        }

        if (assignedClasses !== undefined) {
            updateData.assignedClasses =
                Array.isArray(
                    assignedClasses
                )
                    ? assignedClasses
                    : [];
        }

        const teacher =
            await Teacher.findOneAndUpdate(
                { teacherId },
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).populate(
                "user",
                "username role isVerified"
            );

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        return res.status(200).json({
            message:
                "Teacher updated successfully",

            teacher
        });

    } catch (error) {

        console.error(
            "Update teacher error:",
            error
        );

        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "Teacher email already exists"
            });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// DELETE TEACHER + USER ACCOUNT
// ========================================

const deleteTeacher = async (req, res) => {
    try {

        const { teacherId } = req.params;

        const teacher =
            await Teacher.findOne({
                teacherId
            });

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        // Delete teacher profile
        await Teacher.deleteOne({
            _id: teacher._id
        });

        // Delete linked login account
        if (teacher.user) {
            await User.findByIdAndDelete(
                teacher.user
            );
        }

        return res.status(200).json({
            message:
                "Teacher and login account deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete teacher error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// ========================================
// GET LOGGED-IN TEACHER PROFILE
// Teacher only
// ========================================

const getMyTeacher = async (req, res) => {
    try {

        // Check authentication
        if (
            !req.user ||
            !req.user.userId
        ) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        // Find teacher linked to logged-in User
        const teacher =
            await Teacher.findOne({
                user: req.user.userId
            }).select(
                "teacherId name phone email subjects assignedClasses"
            );

        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher profile not found"
            });
        }

        return res.status(200).json({
            message:
                "Teacher profile retrieved successfully",

            teacher
        });

    } catch (error) {

        console.error(
            "Get my teacher error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyTeacher
};