"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SheetHeader, SheetTitle } from "../ui/sheet";
import NewHeatmapFilter from "./NewHeatmapFilter";
import ViewsDropdown from "./ViewsDropdown";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface CreateHeatmapProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FilterRow {
  id: number;
  condition?: string;
  value?: string;
}

interface FilterGroup {
  id: number;
  rows: FilterRow[];
}

interface AppliedFilters {
  city?: FilterGroup[];
  state?: FilterGroup[];
  country?: FilterGroup[];
}

export default function CreateHeatmap({ onClose, onSuccess }: CreateHeatmapProps) {
  const frequentlyUsed = [
    "Homepage",
    "Checkout",
    "Landing Page",
    "Blog",
    "Product",
    "Shop",
    "Cart",
    "Contact",
    "Category",
    "Pricing",
    "Detail",
    "1",
    "2",
    "3",
    "4",
    "5",
  ];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState("simple");
  const [heatmapName, setHeatmapName] = useState("");
  const [precision, setPrecision] = useState(1000);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [protocol, setProtocol] = useState("https://");
  const [domain, setDomain] = useState("");
  const [useHistoryData, setUseHistoryData] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    domain?: string;
  }>({});

  const router = useRouter();
  const pathname = usePathname();

  const handleApplyFilters = (
    filterType: keyof AppliedFilters,
    filters: FilterGroup[]
  ) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [filterType]: filters,
    }));
    setIsFilterOpen(false);
  };

  const renderFilterSummary = () => {
    if (Object.keys(appliedFilters).length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Applied Filters:
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(appliedFilters).map(([type, filters]) =>
            filters.map((group: FilterGroup, groupIndex: number) => (
              <Badge
                key={`${type}-${groupIndex}`}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {`${type}: ${group.rows.length} condition${
                  group.rows.length > 1 ? "s" : ""
                }`}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    const newFilters = { ...appliedFilters };
                    newFilters[type as keyof AppliedFilters] = newFilters[
                      type as keyof AppliedFilters
                    ]?.filter((_, i) => i !== groupIndex);
                    if (
                      newFilters[type as keyof AppliedFilters]?.length === 0
                    ) {
                      delete newFilters[type as keyof AppliedFilters];
                    }
                    setAppliedFilters(newFilters);
                  }}
                />
              </Badge>
            ))
          )}
        </div>
      </div>
    );
  };

  const validateForm = () => {
    const newErrors: { name?: string; domain?: string } = {};

    if (!heatmapName.trim()) {
      newErrors.name = "Heatmap name is required";
    }

    if (!domain.trim()) {
      newErrors.domain = "Domain is required";
    } else {
      // Basic URL validation
      const domainPattern =
        /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainPattern.test(domain)) {
        newErrors.domain = "Please enter a valid domain";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateHeatmap = async () => {
    if (!validateForm()) {
      return;
    }

    const heatmapData = {
      name: heatmapName,
      url: {
        protocol: protocol,
        domain: domain,
        matchType: selectedMatch,
      },
      precision: precision,
      useHistoryData: useHistoryData,
      filters: appliedFilters,
    };

    try {
      const response = await fetch("/api/heatmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(heatmapData),
      });

      if (!response.ok) {
        throw new Error("Failed to create heatmap");
      }

      const data = await response.json();
      onClose();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to the new heatmap page
      router.push(`${pathname}/${data.heatmap.id}`);
    } catch (error) {
      console.error("Error creating heatmap:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-xl font-semibold text-primary">
            Create new heatmap
          </SheetTitle>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <Select value={protocol} onValueChange={setProtocol}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="https://">https://</SelectItem>
                <SelectItem value="http://">http://</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                placeholder="www.example.com/"
                className={`pr-8 ${errors.domain ? "border-red-500" : ""}`}
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setErrors((prev) => ({ ...prev, domain: undefined }));
                }}
              />
              {errors.domain && (
                <p className="text-sm text-red-500 mt-1">{errors.domain}</p>
              )}
            </div>
            <Select
              defaultValue="simple"
              onValueChange={(value) => setSelectedMatch(value)}
            >
              <SelectTrigger className="w-[160px]">
                {selectedMatch === "simple"
                  ? "Simple match"
                  : selectedMatch === "exact"
                  ? "Exact match"
                  : "Substring match"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">
                  <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg">Simple match</h3>
                    <p className="text-sm text-muted-foreground">
                      Matches the base URL regardless of query parameters
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        https://www.domain.com/
                      </p>
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Check className="h-4 w-4" />
                        <span>https://www.domain.com/</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Check className="h-4 w-4" />
                        <span>https://www.domain.com/?n=1</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-500">
                        <X className="h-4 w-4" />
                        <span>https://www.domain.com/es</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <DropdownMenuSeparator className="my-2" />
                <SelectItem value="exact">
                  <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg">Exact match</h3>
                    <p className="text-sm text-muted-foreground">
                      Matches only the exact URL including query parameters
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        https://www.domain.com/es?n=1
                      </p>
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Check className="h-4 w-4" />
                        <span>https://www.domain.com/es?n=1</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-500">
                        <X className="h-4 w-4" />
                        <span>https://www.domain.com/es</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-500">
                        <X className="h-4 w-4" />
                        <span>http://www.domain.com/es?n=1</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <DropdownMenuSeparator className="my-2" />
                <SelectItem value="pattern">
                  <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-lg">Substring match </h3>
                    <p className="text-sm text-muted-foreground">
                      Matches URLs that contain the specified text anywhere in
                      the path
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">/pricing</p>
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Check className="h-4 w-4" />
                        <span>https://www.domain.com/en/pricing</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Check className="h-4 w-4" />
                        <span>http://domain.com/cs/pricing?n=1#2</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-500">
                        <X className="h-4 w-4" />
                        <span>https://www.domain.com/cs/subpage</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <span className="sr-only">Help</span>?
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold text-blue-900">
              Heatmap name
            </label>
            <Input
              placeholder="E.g.: My awesome heatmap"
              value={heatmapName}
              className={errors.name ? "border-red-500" : ""}
              onChange={(e) => {
                setHeatmapName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-lg font-semibold text-blue-900">
              Frequently used:
            </label>
            <div className="flex flex-wrap gap-2">
              {frequentlyUsed.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                  onClick={() => setHeatmapName(item)}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-blue-900">
                Heatmap precision
              </span>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <span className="sr-only">Help</span>?
              </Button>
            </div>
            <ViewsDropdown precision={precision} setPrecision={setPrecision} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-blue-900">
                Use history data
              </span>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <span className="sr-only">Help</span>?
              </Button>
            </div>
            <Switch
              checked={useHistoryData}
              onCheckedChange={setUseHistoryData}
            />
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
          >
            Filter
          </Button>
          {renderFilterSummary()}
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          className="w-full bg-pink-100 hover:bg-pink-200 text-pink-600"
          onClick={handleCreateHeatmap}
        >
          Create heatmap
        </Button>
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="left" className="w-full sm:w-[400px] p-0">
          <NewHeatmapFilter
            onClose={() => setIsFilterOpen(false)}
            onApplyFilters={handleApplyFilters}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
