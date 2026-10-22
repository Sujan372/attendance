const mongoose = require("mongoose");

const substitutionSchema = new mongoose.Schema(
    {
        originalTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        substituteTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        className: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            trim: true,
            default: "Teacher absent"
        }
    },
    {
        timestamps: true
    }
);

// One substitution for a teacher/class/date combination
substitutionSchema.index(
    {
        originalTeacher: 1,
        className: 1,
        date: 1
    },
    {
        unique: true
    }
);

module.exports =
    mongoose.models.Substitution ||
    mongoose.model("Substitution", substitutionSchema);