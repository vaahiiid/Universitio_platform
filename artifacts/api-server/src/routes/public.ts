import { Router, type Request, type Response } from "express";
import { db, blogPosts } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse {
  data: Record<string, unknown>[];
  pagination: Pagination;
}

// Get all published blog posts (public) - summary only
router.get("/blog", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const query = db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        category: blogPosts.category,
        coverImage: blogPosts.coverImage,
        coverImageAlt: blogPosts.coverImageAlt,
        metaDescription: blogPosts.metaDescription,
        publishedAt: blogPosts.publishedAt,
        tags: blogPosts.tags,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    const countQuery = db
      .select({ value: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    const [{ value: total }] = await countQuery;
    const posts = await query.limit(limit).offset(offset);

    res.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    } as ApiResponse);
  } catch (err) {
    console.error("Get published blog posts error:", err);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// Get single published blog post by slug (public)
router.get("/blog/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));

    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Don't expose draft posts publicly
    if (post.status !== "published") {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Get blog post error:", err);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

export default router;
