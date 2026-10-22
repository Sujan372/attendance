const express = require("express");

const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyTeacher
} = require("../controllers/teacherController");

const router = express.Router();

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createTeacher
);

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getAllTeachers
);
router.get(
    "/me",
    protect,
    authorizeRoles("teacher"),
    getMyTeacher
);
router.get(
    "/:teacherId",
    protect,
    authorizeRoles("admin"),
    getTeacherById
);

router.put(
    "/:teacherId",
    protect,
    authorizeRoles("admin"),
    updateTeacher
);

router.delete(
    "/:teacherId",
    protect,
    authorizeRoles("admin"),
    deleteTeacher
);

module.exports = router;