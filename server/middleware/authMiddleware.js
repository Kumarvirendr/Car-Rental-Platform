import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No Token ,Access Denied(Deny)",
      });
    }


     if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
   
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role != "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin Access Only",
    });
  }
  next();
};

export { protect, isAdmin };
