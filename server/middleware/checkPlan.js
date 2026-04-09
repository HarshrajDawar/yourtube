import users from "../Modals/Auth.js";

export const checkPlanAccess = async (req, res, next) => {
  const { userid } = req.body;
  if (!userid) return res.status(400).json({ message: "User ID is required" });

  try {
    const user = await users.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Attach user to request for further use
    req.user = user;

    const today = new Date();
    if (user.planExpiry && user.planExpiry < today) {
      // Plan expired, reset to Free
      user.plan = "Free";
      user.isPremium = false;
      await user.save();
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
