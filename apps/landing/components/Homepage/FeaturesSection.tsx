"use client";
import { ArrowRight, Link } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<"recording" | "sessionReplay" | "analytics">(
    "recording"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) =>
        current === "recording"
          ? "sessionReplay"
          : current === "sessionReplay"
          ? "analytics"
          : "recording"
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const content = {
    recording: {
      title: "See exactly how users interact with your site.",
      description:
        "Revisit user sessions with unmatched clarity. Play, pause, rewind and skip over inactivity. Go behind the numberes to diagnose technical issues, understand user intent and validate design changes.",
    },
    sessionReplay: {
      title: "Capture full user journeys with precision.",
      description:
        "Track clicks, scrolls, form submissions, mouse movements, bounce rates, and more. Spot friction points and improve conversions.",
    },
    analytics: {
      title: "Transform raw data into actionable insights.",
      description:
        "Empower your marketing and product teams with clean, actionable data to improve customer journey. Understand",
    },
  };

  return (
    <div className="container w-full items-center px-4 py-2 min-h-[580px] space-y-4 flex flex-col justify-center">
        <div className="flex w-full">
            <Button className="h-9 max-w-md rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 sm:text-lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Session replay and analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
        
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ">
        {/* Left Column */}
            <div className="max-w-2xl flex flex-col justify-between h-full">
              <div className="flex flex-col">
                <h1 className="text-xl font-medium tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">
                  {content[activeTab].title}
                </h1>
              <p className="mt-6 max-w-3xl text-md text-muted-foreground sm:text-lg">
                {content[activeTab].description}
              </p>
            </div>  
              <div className="mt-12 lg:mt-24 max-w-lg flex items-center rounded-full bg-slate-200 p-1.5">
                <div
                    className={`flex-1 rounded-full px-3 py-1.5 text-center text-sm font-medium sm:text-base cursor-pointer transition-colors ${
                      activeTab === "recording" ? "bg-slate-300" : ""
                    }`}
                    onClick={() => setActiveTab("recording")}
                  >
                    Recording
                  </div>
                  <div
                    className={`flex-1 rounded-full px-3 py-1.5 text-center text-sm font-medium sm:text-base cursor-pointer transition-colors ${
                      activeTab === "sessionReplay" ? "bg-slate-300" : ""
                    }`}
                    onClick={() => setActiveTab("sessionReplay")}
                  >
                    Replay
                  </div>
                  <div
                    className={`flex-1 rounded-full px-3 py-1.5 text-center text-sm font-medium sm:text-base cursor-pointer transition-colors ${
                      activeTab === "analytics" ? "bg-slate-300" : ""
                    }`}
                    onClick={() => setActiveTab("analytics")}
                  >
                    Analytics
                  </div>
                </div>
            </div>

        {/* Right Column - Placeholder */}
        <div className="mb-8 lg:mb-0">
          <div className="aspect-square rounded-3xl bg-slate-200 w-full max-w-2xl   mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
