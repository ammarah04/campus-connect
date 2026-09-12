import User from "../models/User.js";

// @desc  Get logged-in user's profile
// @route GET /api/users/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update logged-in user's profile
// @route PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, department, semester, interests, skills, profileImage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (department !== undefined) user.department = department;
    if (semester !== undefined) user.semester = semester;
    if (interests !== undefined) user.interests = interests;
    if (skills !== undefined) user.skills = skills;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      universityId: updatedUser.universityId,
      department: updatedUser.department,
      semester: updatedUser.semester,
      interests: updatedUser.interests,
      skills: updatedUser.skills,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};