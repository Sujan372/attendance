const Notice = require("../models/notice");
const Student = require("../models/student");
const Teacher = require("../models/teacher");


// ==========================
// HELPER: GET TEACHER
// ==========================
const getTeacherProfile = async (userId) => {
    return await Teacher.findOne({
        user: userId
    });
};


// ==========================
// HELPER: NORMALIZE CLASS
// ==========================
const normalizeClass = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};


// ==========================
// CREATE NOTICE
// ADMIN + TEACHER
// ==========================
const createNotice = async (req, res) => {
    try {
        const {
            title,
            message,
            noticeType,
            audienceType,
            targetClass,
            targetStudent,
            eventDate,
            eventTime,
            priority,
            expiresAt
        } = req.body;

        // ========================================
        // REQUIRED FIELDS
        // ========================================

        if (
            !title ||
            !message ||
            !noticeType ||
            !audienceType
        ) {
            return res.status(400).json({
                message:
                    "Title, message, notice type and audience are required"
            });
        }

        // ========================================
        // AUTHENTICATED USER
        // ========================================

        if (
            !req.user ||
            !req.user.userId ||
            !req.user.role
        ) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        const userRole =
            String(req.user.role)
                .trim()
                .toLowerCase();

        // ========================================
        // TARGET CLASS VALIDATION
        // ========================================

        if (
            audienceType === "class" &&
            !targetClass
        ) {
            return res.status(400).json({
                message:
                    "Target class is required"
            });
        }

        // ========================================
        // TARGET STUDENT VALIDATION
        // ========================================

        if (
            audienceType === "student" &&
            !targetStudent
        ) {
            return res.status(400).json({
                message:
                    "Target student is required"
            });
        }

        // ========================================
        // ADMIN
        // ========================================

        if (userRole === "admin") {

            let studentProfile = null;

            if (targetStudent) {

                studentProfile =
                    await Student.findById(
                        targetStudent
                    );

                if (!studentProfile) {
                    return res.status(404).json({
                        message:
                            "Target student not found"
                    });
                }
            }

            const notice =
                await Notice.create({

                    title:
                        title.trim(),

                    message:
                        message.trim(),

                    noticeType,

                    audienceType,

                    targetClass:
                        audienceType === "class"
                            ? String(targetClass).trim()
                            : null,

                    targetStudent:
                        audienceType === "student"
                            ? targetStudent
                            : null,

                    createdBy:
                        req.user.userId,

                    eventDate:
                        eventDate || null,

                    eventTime:
                        eventTime?.trim() || null,

                    priority:
                        priority || "normal",

                    expiresAt:
                        expiresAt || null
                });

            await notice.populate([
                {
                    path: "createdBy",
                    select:
                        "username role"
                },
                {
                    path: "targetStudent",
                    select:
                        "studentId name standard rollNumber"
                }
            ]);

            return res.status(201).json({
                message:
                    "Notice created successfully",

                notice
            });
        }


        // ========================================
        // TEACHER
        // ========================================

        if (userRole === "teacher") {

            // Teacher can ONLY target:
            // class or individual student

            if (
                !["class", "student"]
                    .includes(audienceType)
            ) {
                return res.status(403).json({
                    message:
                        "Teachers can only send notices to their classes or students"
                });
            }

            // Find teacher profile
            const teacher =
                await getTeacherProfile(
                    req.user.userId
                );

            if (!teacher) {
                return res.status(403).json({
                    message:
                        "Teacher profile not found"
                });
            }

            const assignedClasses =
                (
                    teacher.assignedClasses ||
                    []
                ).map(normalizeClass);


            // ====================================
            // TEACHER → CLASS NOTICE
            // ====================================

            if (
                audienceType === "class"
            ) {

                const selectedClass =
                    normalizeClass(
                        targetClass
                    );

                if (
                    !assignedClasses.includes(
                        selectedClass
                    )
                ) {
                    return res.status(403).json({
                        message:
                            `You are not assigned to class ${targetClass}`
                    });
                }
            }


            // ====================================
            // TEACHER → STUDENT NOTICE
            // ====================================

            let studentProfile = null;

            if (
                audienceType === "student"
            ) {

                studentProfile =
                    await Student.findById(
                        targetStudent
                    );

                if (!studentProfile) {
                    return res.status(404).json({
                        message:
                            "Target student not found"
                    });
                }

                const studentClass =
                    normalizeClass(
                        studentProfile.standard
                    );

                if (
                    !assignedClasses.includes(
                        studentClass
                    )
                ) {
                    return res.status(403).json({
                        message:
                            "You are not assigned to this student's class"
                    });
                }
            }


            // ====================================
            // CREATE TEACHER NOTICE
            // ====================================

            const notice =
                await Notice.create({

                    title:
                        title.trim(),

                    message:
                        message.trim(),

                    noticeType,

                    audienceType,

                    targetClass:
                        audienceType === "class"
                            ? String(targetClass).trim()
                            : null,

                    targetStudent:
                        audienceType === "student"
                            ? targetStudent
                            : null,

                    createdBy:
                        req.user.userId,

                    eventDate:
                        eventDate || null,

                    eventTime:
                        eventTime?.trim() || null,

                    priority:
                        priority || "normal",

                    expiresAt:
                        expiresAt || null
                });

            await notice.populate([
                {
                    path: "createdBy",
                    select:
                        "username role"
                },
                {
                    path: "targetStudent",
                    select:
                        "studentId name standard rollNumber"
                }
            ]);

            return res.status(201).json({
                message:
                    "Notice created successfully",

                notice
            });
        }


        // ========================================
        // UNKNOWN ROLE
        // ========================================

        return res.status(403).json({
            message:
                "You are not authorized to create notices"
        });

    } catch (error) {

        console.error(
            "Create notice error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ==========================
// GET ALL NOTICES
// ADMIN ONLY
// ==========================
const getAllNotices = async (req, res) => {
    try {

        const notices =
            await Notice.find()
                .populate(
                    "createdBy",
                    "username role"
                )
                .populate(
                    "targetStudent",
                    "studentId name standard rollNumber"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            message:
                "Notices retrieved successfully",

            count:
                notices.length,

            notices
        });

    } catch (error) {

        console.error(
            "Get notices error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ==========================
// GET TEACHER NOTICES
// ==========================
// Teacher sees notices they created
// plus notices for their assigned classes.
// ==========================
const getTeacherNotices = async (
    req,
    res
) => {
    try {

        if (
            !req.user ||
            !req.user.userId
        ) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        const teacher =
            await getTeacherProfile(
                req.user.userId
            );

        if (!teacher) {
            return res.status(403).json({
                message:
                    "Teacher profile not found"
            });
        }

        const assignedClasses =
            (
                teacher.assignedClasses ||
                []
            );

        const teacherClassNotices =
            await Notice.find({
                $or: [

                    // Notices created by teacher
                    {
                        createdBy:
                            req.user.userId
                    },

                    // Notices targeting teacher's classes
                    {
                        audienceType: "class",
                        targetClass: {
                            $in:
                                assignedClasses
                        }
                    }
                ]
            })
                .populate(
                    "createdBy",
                    "username role"
                )
                .populate(
                    "targetStudent",
                    "studentId name standard"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            message:
                "Teacher notices retrieved successfully",

            count:
                teacherClassNotices.length,

            notices:
                teacherClassNotices
        });

    } catch (error) {

        console.error(
            "Get teacher notices error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ==========================
// GET STUDENT NOTICES
// ==========================
const getMyNotices = async (
    req,
    res
) => {
    try {

        if (
            !req.user ||
            !req.user.userId
        ) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        const student =
            await Student.findOne({
                user:
                    req.user.userId
            });

        if (!student) {
            return res.status(404).json({
                message:
                    "Student profile not found"
            });
        }

        const notices =
            await Notice.find({
                $or: [

                    // School-wide
                    {
                        audienceType: "all"
                    },

                    // Class
                    {
                        audienceType: "class",
                        targetClass:
                            student.standard
                    },

                    // Student-specific
                    {
                        audienceType: "student",
                        targetStudent:
                            student._id
                    }
                ]
            })
                .populate(
                    "createdBy",
                    "username role"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            message:
                "Your notices retrieved successfully",

            count:
                notices.length,

            notices
        });

    } catch (error) {

        console.error(
            "Get my notices error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error"
        });
    }
};


// ==========================
// DELETE NOTICE
// ADMIN ONLY
// ==========================
const deleteNotice = async (
    req,
    res
) => {
    try {

        const { id } = req.params;

        const notice =
            await Notice.findById(id);

        if (!notice) {
            return res.status(404).json({
                message:
                    "Notice not found"
            });
        }

        await Notice.findByIdAndDelete(
            id
        );

        return res.status(200).json({
            message:
                "Notice deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete notice error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error"
        });
    }
};


module.exports = {
    createNotice,
    getAllNotices,
    getTeacherNotices,
    getMyNotices,
    deleteNotice
};