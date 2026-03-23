import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, Search, ChevronLeft, ChevronRight, Plus, Loader2
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  highlightedQuote?: string;
  content: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse {
  data: BlogPost[];
  pagination: Pagination;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

function CreatePostForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    category: "",
    tags: "",
    coverImage: "",
    coverImageAlt: "",
    highlightedQuote: "",
    content: "",
    status: "draft" as "draft" | "published",
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.metaTitle.trim()) newErrors.metaTitle = "Meta title is required";
    if (!formData.metaDescription.trim()) newErrors.metaDescription = "Meta description is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.coverImage.trim()) newErrors.coverImage = "Cover image URL is required";
    if (!formData.coverImageAlt.trim()) newErrors.coverImageAlt = "Cover image alt text is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        publishedAt: formData.status === "published" ? new Date().toISOString() : null,
      };

      await apiFetch("/admin/blog", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onCreated();
    } catch (e) {
      console.error("Create post error:", e);
      setErrors({ submit: "Failed to create post" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold">Create New Blog Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Blog post title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="blog-post-slug"
              className={errors.slug ? "border-red-500" : ""}
            />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Title *</label>
            <Input
              value={formData.metaTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
              placeholder="SEO meta title"
              className={errors.metaTitle ? "border-red-500" : ""}
            />
            {errors.metaTitle && <p className="text-xs text-red-500 mt-1">{errors.metaTitle}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Description *</label>
            <Input
              value={formData.metaDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="SEO meta description"
              className={errors.metaDescription ? "border-red-500" : ""}
            />
            {errors.metaDescription && <p className="text-xs text-red-500 mt-1">{errors.metaDescription}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Tips, News, Tutorial"
              className={errors.category ? "border-red-500" : ""}
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Cover Image URL *</label>
            <Input
              value={formData.coverImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
              placeholder="/images/cover.jpg"
              className={errors.coverImage ? "border-red-500" : ""}
            />
            {errors.coverImage && <p className="text-xs text-red-500 mt-1">{errors.coverImage}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Cover Image Alt Text *</label>
            <Input
              value={formData.coverImageAlt}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverImageAlt: e.target.value }))}
              placeholder="Descriptive alt text"
              className={errors.coverImageAlt ? "border-red-500" : ""}
            />
            {errors.coverImageAlt && <p className="text-xs text-red-500 mt-1">{errors.coverImageAlt}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Highlighted Quote</label>
            <Input
              value={formData.highlightedQuote}
              onChange={(e) => setFormData((prev) => ({ ...prev, highlightedQuote: e.target.value }))}
              placeholder="Optional featured quote"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Content (HTML) *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="<h2>Heading</h2><p>Paragraph content here...</p>"
              rows={8}
              className={`font-mono text-sm ${errors.content ? "border-red-500" : ""}`}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
            <p className="text-xs text-muted-foreground mt-1">Use HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a href=""&gt;</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <Select value={formData.status} onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val as "draft" | "published" }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ListView() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await apiFetch<ApiResponse>(`/admin/blog?${params}`);
      setPosts(res.data);
      setPagination(res.pagination);

      const allCats = new Set<string>();
      res.data.forEach((post) => {
        if (post.category) allCats.add(post.category);
      });
      setCategories(allCats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) => !categoryFilter || post.category === categoryFilter);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {Array.from(categories).sort().map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No blog posts found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground">{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{post.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(post.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {pagination.total} posts
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchPosts(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground py-1">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchPosts(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground mt-1">Manage your blog content</p>
          </div>
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {showCreate ? "Cancel" : "New Post"}
          </Button>
        </div>

        {showCreate && (
          <div className="mb-8">
            <CreatePostForm
              onCancel={() => setShowCreate(false)}
              onCreated={() => {
                setShowCreate(false);
                window.location.reload();
              }}
            />
          </div>
        )}

        {!showCreate && <ListView />}
      </div>
    </AdminLayout>
  );
}
