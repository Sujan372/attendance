const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const userRole = String(
            req.user.role || ""
        )
            .trim()
            .toLowerCase();

        const roles = allowedRoles.map(
            role =>
                String(role)
                    .trim()
                    .toLowerCase()
        );

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = {
    authorizeRoles
};