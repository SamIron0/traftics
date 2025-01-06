import React from "react";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[45fr_55fr]">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <img
            src="/logo-text.svg"
            alt="Traftics Logo"
            width={120}
            height={14}
            className="mb-8"
          />
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Get started with Traftics
            </h1>
          
          </div>
          <SignupForm />
        </div>
      </div>
      
      {/* Right Column - Image/Gradient */}
      <div className="hidden md:block relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/auth-img.png"
            alt="Auth illustration"
          />
        </div>
      </div>
    </div>
  );
} 