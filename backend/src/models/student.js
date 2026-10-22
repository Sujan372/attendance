const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        standard: {
            type: String,
            required: true,
            trim: true
        },

        rollNumber: {
            type: Number,
            required: true
        },

        academicYear: {
            type: String,
            required: true,
            trim: true
        },

        guardianName: {
            type: String,
            required: true,
            trim: true
        },

        guardianPhone: {
            type: String,
            required: true,
            trim: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Student ||
    mongoose.model("Student", studentSchema);