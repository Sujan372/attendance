const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        examType: {
            type: String,
            enum: ["Midterm", "Final", "Quiz", "Assignment", "Practical"],
            required: true
        },
        marksObtained: {
            type: Number,
            required: true,
            min: 0
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 1
        },
        grade: {
            type: String,
            default: null
        },
        class: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Auto-calculate grade before saving
markSchema.pre("save", function() {
    const percentage = (this.marksObtained / this.totalMarks) * 100;

    if (percentage >= 90) this.grade = "A+";
    else if (percentage >= 80) this.grade = "A";
    else if (percentage >= 70) this.grade = "B+";
    else if (percentage >= 60) this.grade = "B";
    else if (percentage >= 50) this.grade = "C+";
    else if (percentage >= 40) this.grade = "C";
    else if (percentage >= 33) this.grade = "D";
    else this.grade = "F";
}); 

module.exports =
    mongoose.models.Mark || mongoose.model("Mark", markSchema);