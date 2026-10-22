const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        noticeType: {
            type: String,
            enum: [
                "late-coming",
                "early-leave",
                "class-leave",
                "holiday",
                "extra-class",
                "exam",
                "meeting",
                "general"
            ],
            required: true
        },

        audienceType: {
            type: String,
            enum: [
                "all",
                "class",
                "student",
                "teachers"
            ],
            required: true
        },

        targetClass: {
            type: String,
            trim: true,
            default: null
        },

        targetStudent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        eventDate: {
            type: Date,
            default: null
        },

        eventTime: {
            type: String,
            trim: true,
            default: null
        },

        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal"
        },

        expiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Notice ||
    mongoose.model("Notice", noticeSchema);