"use client";

import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

interface CountryFilterProps {
  onClose: () => void;
  onApply: (filters: FilterGroup[]) => void;
}

interface FilterGroup {
  id: number;
  rows: { id: number }[];
}

export default function CountryFilter({ onClose, onApply }: CountryFilterProps) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    { id: 1, rows: [{ id: 1 }] }
  ]);

  const addNewRow = (groupId: number) => {
    setFilterGroups(groups => 
      groups.map(group => 
        group.id === groupId 
          ? { ...group, rows: [...group.rows, { id: group.rows.length + 1 }] }
          : group
      )
    );
  };

  const removeRow = (groupId: number, rowId: number) => {
    setFilterGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, rows: group.rows.filter(row => row.id !== rowId) }
          : group
      )
    );
  };

  const addNewGroup = () => {
    setFilterGroups(groups => [
      ...groups,
      { id: groups.length + 1, rows: [{ id: 1 }] }
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background justify-between">
      <div>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronRight className="h-6 w-6 rotate-180" />
            </Button>
            <SheetTitle className="text-xl font-semibold text-primary">
              Country
            </SheetTitle>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {filterGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {groupIndex > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-[1px] flex-1 bg-border" />
                  <span className="text-sm text-muted-foreground px-2">AND</span>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>
              )}
              {group.rows.map((row, index) => (
                <>
                  {index > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-[1px] flex-1 bg-border" />
                      <span className="text-sm text-muted-foreground px-2">OR</span>
                      <div className="h-[1px] flex-1 bg-border" />
                    </div>
                  )}
                  <div key={row.id} className="flex gap-2">
                    <Select defaultValue="is">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="is">Is</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="startsWith">Starts with</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select country..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    {index === group.rows.length - 1 ? (
                      <Button variant="outline" className="w-[60px]" onClick={() => addNewRow(group.id)}>
                        or
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(group.id, row.id)}
                        className="w-[60px]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              ))}
            </div>
          ))}

          <Button variant="outline" className="w-[100px]" onClick={addNewGroup}>
            AND
          </Button>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-blue-900">
            <p className="text-lg font-semibold mb-2">Tip:</p>
            <p>
              Select multiple countries to include data from various regions. You can
              combine this with City or State/Region filters to get more specific
              location data.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-end p-6">
        <Button 
          className="rounded-full px-8" 
          onClick={() => {
            onApply(filterGroups);
            onClose();
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
} 