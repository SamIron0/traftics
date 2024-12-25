"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function   ErrorSection() {
  
  return (
    <div className=" w-full grid grid-cols-1 lg:grid-cols-2  gap-8 justify-center items-center py-16 ">
    <div className="space-y-6 lg:space-y-48 max-w-lg">
      <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight">
        Built in Error Monitoring
      </h2>
   <div className="flex flex-col gap-4">
      <p className="text-lg text-muted-foreground leading-relaxed">
      See exactly when and where things go wrong. Traftics lets you identify and fix errors and botttlenecks before they hurt your conversions.
      </p>
      <Link
        href="/expense-management"
        className="inline-flex items-center text-lg hover:underline"
      >
        Error Monitoring
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link></div>
    </div>
    <div className="flex items-center justify-center">
    <div className="bg-muted  rounded-lg aspect-square md:aspect-video w-full" /></div>
  </div>
  )
}