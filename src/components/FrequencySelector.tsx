"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FrequencySelectorProps {
  value: "monthly" | "daily";
  onValueChange: (value: "monthly" | "daily") => void;
  disabled?: boolean;
}

export function FrequencySelector({
  value,
  onValueChange,
  disabled,
}: FrequencySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="frequency">Frequency</Label>
      <Select
        id="frequency"
        value={value}
        onChange={(e) => onValueChange(e.target.value as "monthly" | "daily")}
        disabled={disabled}
      >
        <option value="monthly">Monthly</option>
        <option value="daily">Daily</option>
      </Select>
    </div>
  );
}





