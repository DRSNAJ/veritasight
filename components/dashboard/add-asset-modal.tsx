"use client";

import { useState } from "react";
import type { ManualAsset, AssetType } from "@/lib/types";
import { addAsset } from "@/lib/api";
import { Modal, Button, Input } from "@/components/ui";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: ManualAsset) => void;
}

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "FD", label: "Fixed Deposit" },
  { value: "BOND", label: "Bond" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
];

export function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("FD");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name || !value) {
      setError("Please fill required fields");
      return;
    }

    const valueNum = parseFloat(value);
    if (isNaN(valueNum) || valueNum < 0) {
      setError("Invalid value");
      return;
    }

    setLoading(true);
    const result = await addAsset(name, type, valueNum, notes || undefined);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (result.data) {
      onAdd(result.data);
      handleClose();
    }
  }

  function handleClose() {
    setName("");
    setType("FD");
    setValue("");
    setNotes("");
    setError("");
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Asset">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Commercial Bank FD"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AssetType)}
            className="w-full px-3 py-2 bg-secondary border border-border-subtle rounded-lg
              text-text-primary focus:outline-none focus:border-veritasight-blue"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Value (LKR)</label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Notes (optional)</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Maturity date, interest rate, etc."
          />
        </div>

        {error && <p className="text-loss text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Asset
          </Button>
        </div>
      </form>
    </Modal>
  );
}
