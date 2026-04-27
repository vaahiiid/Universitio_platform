import { useEffect, useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Upload, FileArchive, Check, Loader2, AlertCircle } from "lucide-react";

interface ImportRecord {
  id: number;
  filename: string;
  postCount: number;
  imageCount: number;
  importedBy: string;
  createdAt: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function BlogImportPage() {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ postCount: number; imageCount: number } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch<ImportRecord[]>("/admin/blog-imports")
      .then(setImports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const body = await apiFetch<{ postCount: number; imageCount: number }>("/admin/blog-import", {
        method: "POST",
        body: formData,
      });
      setResult({ postCount: body.postCount, imageCount: body.imageCount });
      const updated = await apiFetch<ImportRecord[]>("/admin/blog-imports");
      setImports(updated);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Import</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a ZIP file containing posts.json and an images/ folder to import blog content.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <FileArchive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Upload Blog ZIP</h3>
              <p className="text-xs text-muted-foreground">Max 50MB, up to 500 posts, images under 100MB uncompressed.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".zip"
              className="flex-1 text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-[#42147d] file:text-white file:font-medium file:cursor-pointer hover:file:bg-[#42147d]/90"
            />
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-[#42147d] hover:bg-[#42147d]/90 text-white"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? "Uploading..." : "Upload & Import"}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              <Check className="w-4 h-4 shrink-0" />
              Successfully imported {result.postCount} posts and {result.imageCount} images.
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Import History</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : imports.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No imports yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {imports.map((imp) => (
                <div key={imp.id} className="px-5 py-3.5 flex items-center gap-4">
                  <FileArchive className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{imp.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {imp.postCount} posts, {imp.imageCount} images — by {imp.importedBy}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(imp.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
