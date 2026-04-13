"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddVendorDialog } from "./add-vendor-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Vendor } from "@/lib/types";

interface Props {
  initialData: Vendor[];
}

export function VendorsGrid({ initialData }: Props) {
  const [vendors, setVendors] = useRealtime("coeo_vendors", initialData);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = vendors.find((v) => v.id === deleteId);
    setVendors((prev) => prev.filter((v) => v.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_vendors").delete().eq("id", deleteId);
    if (error) {
      if (original) setVendors((prev) => [...prev, original]);
      toast.error("Failed to delete vendor");
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add vendor</Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-cream border border-border rounded-card p-4 group relative"
          >
            <button
              onClick={() => setDeleteId(vendor.id)}
              className="absolute top-2 right-3 text-[10px] text-text-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
            <div className="text-[13px] font-semibold text-primary mb-1">{vendor.name}</div>
            {vendor.subtitle && (
              <div className="text-[11px] text-text-secondary mb-1">{vendor.subtitle}</div>
            )}
            {vendor.role && (
              <div className="text-[11px] text-text-muted mb-2">{vendor.role}</div>
            )}
            <Badge status={vendor.status} />
            {vendor.contact_name && (
              <div className="text-[10px] text-text-muted mt-3 border-t border-border pt-2">
                {vendor.contact_name}
                {vendor.contact_email && ` · ${vendor.contact_email}`}
              </div>
            )}
          </div>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="py-8 text-center text-[13px] text-text-muted">No vendors yet</div>
      )}

      <AddVendorDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(vendor) => setVendors((prev) => [...prev, vendor])}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete vendor"
        message="Are you sure you want to delete this vendor?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
