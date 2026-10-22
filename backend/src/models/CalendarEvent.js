const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        eventType: {
            type: String,
            enum: [
                "holiday",
                "exam",
                "meeting",
                "school-event",
                "extra-class",
                "activity",
                "general"
            ],
            required: true
        },

        audienceType: {
            type: String,
            enum: [
                "all",
                "class",
                "teachers",
                "students"
            ],
            required: true
        },

        targetClass: {
            type: String,
            trim: true,
            default: null
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            default: null
        },

        eventTime: {
            type: String,
            trim: true,
            default: null
        },

        location: {
            type: String,
            trim: true,
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

calendarEventSchema.index({
    startDate: 1
});

calendarEventSchema.index({
    audienceType: 1,
    targetClass: 1,
    startDate: 1
});

module.exports =
    mongoose.models.CalendarEvent ||
    mongoose.model("CalendarEvent", calendarEventSchema);   