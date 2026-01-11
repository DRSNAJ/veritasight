"use client";

import { useState } from "react";
import type { ManualAsset, AssetType } from "@/lib/types";
import { updateAsset, deleteAsset } from "@/lib/api";
import { formatCurrency } from "@/lib/calculations";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableRowSkeleton,
  Button,
  Input,
} from "@/components/ui";
import { AddAssetModal } from "./add-asset-modal";

interface ManualAssetsTableProps {
  assets: ManualAsset[];
  loading: boolean;
  onAssetsChange: (assets: ManualAsset[]) => void;
}

const TYPE_LABELS: Record<AssetType, string> = {
  FD: "Fixed Deposit",
  BOND: "Bond",
  CASH: "Cash",
  OTHER: "Other",
};

export function ManualAssetsTable({
  assets,
  loading,
  onAssetsChange,
}: ManualAssetsTableProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  async function handleSaveValue(asset: ManualAsset) {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      setEditingId(null);
      return;
    }

    const result = await updateAsset(asset.id, { value: newValue });
    if (result.data) {
      onAssetsChange(
        assets.map((a) => (a.id === asset.id ? result.data! : a))
      );
    }
    setEditingId(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this asset?")) return;
    await deleteAsset(id);
    onAssetsChange(assets.filter((a) => a.id !== id));
  }

  function handleAdd(newAsset: ManualAsset) {
    onAssetsChange([...assets, newAsset]);
  }

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="bg-secondary border border-border-subtle rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Other Assets</h2>
          <span className="text-sm text-text-muted font-mono">
            Total: LKR {formatCurrency(totalValue)}
          </span>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Add Asset</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead numeric>Value (LKR)</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <>
              <TableRowSkeleton columns={5} />
              <TableRowSkeleton columns={5} />
            </>
          ) : assets.length === 0 ? (
            <TableRow>
              <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                No other assets. Add FDs, bonds, or cash holdings.
              </td>
            </TableRow>
          ) : (
            assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="text-text-primary font-medium">
                  {asset.name}
                </TableCell>
                <TableCell>{TYPE_LABELS[asset.type]}</TableCell>
                <TableCell numeric>
                  {editingId === asset.id ? (
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-28 text-right"
                      autoFocus
                      onBlur={() => handleSaveValue(asset)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveValue(asset)}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(asset.id);
                        setEditValue(asset.value.toString());
                      }}
                      className="hover:text-veritasight-blue transition-colors"
                    >
                      {formatCurrency(asset.value)}
                    </button>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-text-muted">
                  {asset.notes || "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(asset.id)}
                    className="text-text-muted hover:text-loss p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
