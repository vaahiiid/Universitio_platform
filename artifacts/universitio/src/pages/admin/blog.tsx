import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BlogForm, type BlogPost } from "@/components/admin/BlogForm";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, Search, ChevronLeft, ChevronRight, Plus, Loader2, Edit2, Trash2
} from "lucide-react";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";

interface BlogPostWithDates extends BlogPost {
  id: number;
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
  data: BlogPostWithDates[];
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

function ListView({ onEdit }: { onEdit: (post: BlogPostWithDates) => void }) {
  const [posts, setPosts] = useState<BlogPostWithDates[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostWithDates | null>(null);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await apiFetch<ApiResponse>(`/admin/blog?${params}`);
      setPosts(res.data);
      setPagination(res.pagination);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      console.error("Error fetching posts:", e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) => !categoryFilter || post.category === categoryFilter);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/admin/blog/${deleteTarget.slug}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchPosts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-medium">Error loading posts</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
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
            {BLOG_CATEGORIES && Array.isArray(BLOG_CATEGORIES) && BLOG_CATEGORIES.map((cat) => (
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
      ) : error ? (
        <div className="text-center py-10 text-red-600">
          Failed to load blog posts. Please refresh the page.
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
                <th className="px-4 py-3 text-center font-medium">Actions</th>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(post)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(post)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
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

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function BlogPage() {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingPost, setEditingPost] = useState<BlogPostWithDates | null>(null);

  const handleEdit = (post: BlogPostWithDates) => {
    setEditingPost(post);
    setMode("edit");
  };

  const handleCreateCancel = () => {
    setMode("list");
    setEditingPost(null);
  };

  const handleCreateSubmit = async (data: BlogPost) => {
    const payload = {
      ...data,
      publishedAt: data.status === "published" ? new Date().toISOString() : null,
    };
    await apiFetch("/admin/blog", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    handleCreateCancel();
    window.location.reload();
  };

  const handleEditSubmit = async (data: BlogPost) => {
    if (!editingPost) return;
    await apiFetch(`/admin/blog/${editingPost.slug}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    handleCreateCancel();
    window.location.reload();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          {mode !== "list" && (
            <button
              onClick={handleCreateCancel}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog Posts
            </button>
          )}
        </div>

        {mode === "list" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
                <p className="text-muted-foreground mt-1">Manage your blog content</p>
              </div>
              <Button onClick={() => setMode("create")} className="gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>
            <ListView onEdit={handleEdit} />
          </>
        )}

        {mode === "create" && (
          <BlogForm
            onSubmit={handleCreateSubmit}
            onCancel={handleCreateCancel}
          />
        )}

        {mode === "edit" && editingPost && (
          <BlogForm
            initialData={editingPost}
            onSubmit={handleEditSubmit}
            onCancel={handleCreateCancel}
            isEditing={true}
          />
        )}
      </div>
    </AdminLayout>
  );
}
