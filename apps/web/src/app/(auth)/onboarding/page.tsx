"use client";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Tell us a bit about yourself to get started
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
} 