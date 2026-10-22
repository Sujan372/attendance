const express = require("express");

const protect = require("../middleware/authMiddleware");
const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

const {
    createSubstitution,
    getAllSubstitutions,
    deleteSubstitution
} = require("../controllers/substitutionController");

const router = express.Router();

// Admin creates substitution
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createSubstitution
);

// Admin views substitutions
router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getAllSubstitutions
);

// Admin deletes substitution
router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteSubstitution
);

module.exports = router;