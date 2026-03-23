import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";

export interface BlogPost {
  id?: number;
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
}

interface BlogFormProps {
  initialData?: BlogPost | null;
  onSubmit: (data: BlogPost) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function BlogForm({ initialData, onSubmit, onCancel, isEditing = false }: BlogFormProps) {
  const [formData, setFormData] = useState<BlogPost>(
    initialData || {
      title: "",
      slug: "",
      metaTitle: "",
      metaDescription: "",
      category: "",
      tags: [],
      coverImage: "",
      coverImageAlt: "",
      highlightedQuote: "",
      content: "",
      status: "draft",
    }
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing && !prev.slug ? generateSlug(title) : prev.slug,
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
      const payload: BlogPost = {
        ...formData,
        tags: typeof formData.tags === "string"
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : formData.tags,
      };

      await onSubmit(payload);
    } catch (e) {
      console.error("Form submit error:", e);
      setErrors({ submit: "Failed to save post" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        </h2>
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
            <Select value={formData.category} onValueChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input
              value={typeof formData.tags === "string" ? formData.tags : formData.tags.join(", ")}
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
              value={formData.highlightedQuote || ""}
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
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Post"
            ) : (
              "Create Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
