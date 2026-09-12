import StudyResource, { RESOURCE_TYPE_LIST } from "../models/StudyResource.js";

// @desc  Get study resources (scoped to requester's department, unless universityAdmin)
// @route GET /api/study-resources
export const getStudyResources = async (req, res) => {
  try {
    const { resourceType, courseCode, search } = req.query;
    const filter = { isDeleted: false };

    if (req.user.role !== "universityAdmin") filter.department = req.user.department;
    if (resourceType) filter.resourceType = resourceType;
    if (courseCode) filter.courseCode = { $regex: courseCode, $options: "i" };
    if (search) filter.title = { $regex: search, $options: "i" };

    const resources = await StudyResource.find(filter)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single study resource
// @route GET /api/study-resources/:id
export const getStudyResourceById = async (req, res) => {
  try {
    const resource = await StudyResource.findOne({ _id: req.params.id, isDeleted: false }).populate(
      "uploadedBy",
      "name"
    );
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (req.user.role !== "universityAdmin" && resource.department !== req.user.department) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Upload a study resource (file required, department inherited from uploader)
// @route POST /api/study-resources
export const uploadStudyResource = async (req, res) => {
  try {
    const { title, description, resourceType, courseCode } = req.body;

    if (!title || !resourceType) {
      return res.status(400).json({ message: "Title and resource type are required" });
    }
    if (!RESOURCE_TYPE_LIST.includes(resourceType)) {
      return res.status(400).json({ message: `resourceType must be one of: ${RESOURCE_TYPE_LIST.join(", ")}` });
    }
    if (!req.file) {
      return res.status(400).json({ message: "A file is required" });
    }

    const resource = await StudyResource.create({
      title,
      description,
      resourceType,
      courseCode,
      department: req.user.department,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
    });

    res.status(201).json(resource);
  }    catch (error) {
    console.log("UPLOAD ERROR MESSAGE: " + error.message);
    console.log("UPLOAD ERROR STACK: " + error.stack);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a study resource (uploader or universityAdmin only)
// @route DELETE /api/study-resources/:id
export const deleteStudyResource = async (req, res) => {
  try {
    const resource = await StudyResource.findOne({ _id: req.params.id, isDeleted: false });
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const isOwner = resource.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to delete this resource" });
    }

    resource.isDeleted = true;
    await resource.save();

    res.status(200).json({ message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};