import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
}

export function DeleteDialog({ open, onOpenChange, onConfirm, title, description }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      onOpenChange(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && onOpenChange(false)} />
      <div className="relative bg-white rounded-xl border border-border shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
