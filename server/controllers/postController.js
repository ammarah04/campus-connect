import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// @desc  Get all posts (scoped to the requester's department, unless universityAdmin)
// @route GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    if (req.user.role !== "universityAdmin") filter.department = req.user.department;

    const posts = await Post.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id, isDeleted: false });
        return { ...post.toObject(), commentCount, likeCount: post.likes.length };
      })
    );

    res.status(200).json(postsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single post with comments
// @route GET /api/posts/:id
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).populate(
      "createdBy",
      "name"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (req.user.role !== "universityAdmin" && post.department !== req.user.department) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ post: post._id, isDeleted: false })
      .populate("createdBy", "name")
      .sort({ createdAt: 1 });

    res.status(200).json({
      ...post.toObject(),
      likeCount: post.likes.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a post (department inherited from the author)
// @route POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const post = await Post.create({
      title,
      content,
      category,
      department: req.user.department,
      createdBy: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update a post
// @route PUT /api/posts/:id
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const { title, content, category } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;

    const updated = await post.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete a post
// @route DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.createdBy.toString() !== req.user._id.toString() && req.user.role !== "universityAdmin") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    post.isDeleted = true;
    await post.save();

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Toggle like on a post
// @route POST /api/posts/:id/like
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === req.user._id.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ likeCount: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add a comment to a post
// @route POST /api/posts/:id/comments
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      post: post._id,
      content,
      createdBy: req.user._id,
    });

    const populated = await comment.populate("createdBy", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Report a post
// @route PUT /api/posts/:id/report
export const reportPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isReported = true;
    await post.save();

    res.status(200).json({ message: "Post reported" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};