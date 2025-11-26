"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CommoditySelectorProps {
  commodities: string[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function CommoditySelector({
  commodities,
  value,
  onValueChange,
  disabled,
}: CommoditySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="commodity">Commodity</Label>
      <Select
        id="commodity"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select a commodity</option>
        {commodities.map((commodity) => (
          <option key={commodity} value={commodity}>
            {commodity}
          </option>
        ))}
      </Select>
    </div>
  );
}





