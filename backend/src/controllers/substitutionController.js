const Substitution = require("../models/substitution");
const Teacher = require("../models/teacher");

// ==========================
// HELPER: NORMALIZE DATE
// ==========================
const normalizeDate = (dateInput) => {
    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        )
    );
};


// ==========================
// CREATE SUBSTITUTION
// ADMIN ONLY
// ==========================
const createSubstitution = async (req, res) => {
    try {
        const {
            originalTeacherId,
            substituteTeacherId,
            className,
            date,
            reason
        } = req.body;

        // Check required fields
        if (
            !originalTeacherId ||
            !substituteTeacherId ||
            !className ||
            !date
        ) {
            return res.status(400).json({
                message:
                    "Original teacher, substitute teacher, class and date are required"
            });
        }

        // Teachers cannot substitute themselves
        if (originalTeacherId === substituteTeacherId) {
            return res.status(400).json({
                message:
                    "Original teacher and substitute teacher must be different"
            });
        }

        // Normalize date
        const substitutionDate = normalizeDate(date);

        if (!substitutionDate) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        // Find original teacher
        const originalTeacher = await Teacher.findOne({
            teacherId: String(originalTeacherId).trim()
        });

        if (!originalTeacher) {
            return res.status(404).json({
                message: "Original teacher not found"
            });
        }

        // Find substitute teacher
        const substituteTeacher = await Teacher.findOne({
            teacherId: String(substituteTeacherId).trim()
        });

        if (!substituteTeacher) {
            return res.status(404).json({
                message: "Substitute teacher not found"
            });
        }

        // Check whether original teacher is assigned to the class
        const originalClasses = (originalTeacher.assignedClasses || [])
            .map(value => String(value).trim().toLowerCase());

        const selectedClass = String(className)
            .trim()
            .toLowerCase();

        if (!originalClasses.includes(selectedClass)) {
            return res.status(400).json({
                message:
                    `${originalTeacher.name} is not assigned to class ${className}`
            });
        }

        // Check whether substitute teacher is assigned to this class already
        const substituteClasses = (substituteTeacher.assignedClasses || [])
            .map(value => String(value).trim().toLowerCase());

        if (substituteClasses.includes(selectedClass)) {
            return res.status(400).json({
                message:
                    `${substituteTeacher.name} is already assigned to class ${className}`
            });
        }

        // Check duplicate substitution
        const existingSubstitution = await Substitution.findOne({
            originalTeacher: originalTeacher._id,
            className: String(className).trim(),
            date: substitutionDate
        });

        if (existingSubstitution) {
            return res.status(400).json({
                message:
                    "A substitution already exists for this teacher, class and date"
            });
        }

        // Create substitution
        const substitution = await Substitution.create({
            originalTeacher: originalTeacher._id,
            substituteTeacher: substituteTeacher._id,
            className: String(className).trim(),
            date: substitutionDate,
            reason:
                reason?.trim() ||
                "Teacher absent"
        });

        // Populate teacher information
        await substitution.populate([
            {
                path: "originalTeacher",
                select: "teacherId name assignedClasses"
            },
            {
                path: "substituteTeacher",
                select: "teacherId name assignedClasses"
            }
        ]);

        return res.status(201).json({
            message: "Teacher substitution created successfully",
            substitution
        });

    } catch (error) {
        console.error(
            "Create substitution error:",
            error
        );

        // Duplicate index
        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "A substitution already exists for this teacher, class and date"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// GET ALL SUBSTITUTIONS
// ADMIN ONLY
// ==========================
const getAllSubstitutions = async (req, res) => {
    try {
        const substitutions = await Substitution.find()
            .populate(
                "originalTeacher",
                "teacherId name"
            )
            .populate(
                "substituteTeacher",
                "teacherId name"
            )
            .sort({
                date: -1,
                createdAt: -1
            });

        return res.status(200).json({
            message:
                "Substitutions retrieved successfully",
            count: substitutions.length,
            substitutions
        });

    } catch (error) {
        console.error(
            "Get substitutions error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ==========================
// DELETE SUBSTITUTION
// ADMIN ONLY
// ==========================
const deleteSubstitution = async (req, res) => {
    try {
        const { id } = req.params;

        const substitution =
            await Substitution.findById(id);

        if (!substitution) {
            return res.status(404).json({
                message: "Substitution not found"
            });
        }

        await Substitution.findByIdAndDelete(id);

        return res.status(200).json({
            message:
                "Substitution deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete substitution error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createSubstitution,
    getAllSubstitutions,
    deleteSubstitution
};