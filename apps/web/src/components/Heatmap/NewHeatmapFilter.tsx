import { ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetTitle } from "@/components/ui/sheet";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";
import CityFilter from "./Filter/CityFilter";
import StateFilter from "./Filter/StateFilter";
import CountryFilter from "./Filter/CountryFilter";

// Add these type definitions
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

interface NewHeatmapFilterProps {
  onClose: () => void;
  onApplyFilters: (filterType: keyof AppliedFilters, filters: FilterGroup[]) => void;
}

export default function NewHeatmapFilter({ onClose, onApplyFilters }: NewHeatmapFilterProps) {
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [stateSheetOpen, setStateSheetOpen] = useState(false);
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);

  const handleFilterApply = (filterType: keyof AppliedFilters, filters: FilterGroup[]) => {
    onApplyFilters(filterType, filters);
    onClose();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronRight className="h-6 w-6 rotate-180" />
          </Button>
          <SheetTitle className="text-xl font-semibold text-primary">
            New Heatmap
          </SheetTitle>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Location Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <MapPin className="h-5 w-5" />
              <span>Location</span>
            </div>
            <div className="space-y-1">
              {["City", "Country", "State/region"].map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="w-full justify-between h-12 font-normal"
                  onClick={() => {
                    if (item === "City") {
                      setCitySheetOpen(true);
                    } else if (item === "State/region") {
                      setStateSheetOpen(true);
                    } else if (item === "Country") {
                      setCountrySheetOpen(true);
                    }
                  }}
                >
                  {item}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>

        </div>
      </ScrollArea>

      <Sheet open={citySheetOpen} onOpenChange={setCitySheetOpen}>
        <SheetContent side="left" className="w-full sm:w-[400px] p-0">
          <CityFilter 
            onClose={() => setCitySheetOpen(false)} 
            onApply={(filters) => handleFilterApply('city', filters)}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={stateSheetOpen} onOpenChange={setStateSheetOpen}>
        <SheetContent side="left" className="w-full sm:w-[400px] p-0">
          <StateFilter 
            onClose={() => setStateSheetOpen(false)} 
            onApply={(filters) => handleFilterApply('state', filters)}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={countrySheetOpen} onOpenChange={setCountrySheetOpen}>
        <SheetContent side="left" className="w-full sm:w-[400px] p-0">
          <CountryFilter 
            onClose={() => setCountrySheetOpen(false)} 
            onApply={(filters) => handleFilterApply('country', filters)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
