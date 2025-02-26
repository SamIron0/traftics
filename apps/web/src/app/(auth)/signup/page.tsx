"use client";
import React from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import Image from "next/image";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";

export default function SignupPage() {
  const { user } = useAuthStatus();
  const router = useRouter();
  const projectSlug = useAppStore((state) => state.projectSlug);

  useEffect(() => {
    if (user) {
      if (projectSlug) {
        router.push(`/project/${projectSlug}/dashboard`);
      } else {
        router.push('/');
      }
    }
  }, [user, router, projectSlug]);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[45fr_55fr]">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <Image
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
          <Image
            src="/auth-img.png"
            alt="Auth illustration"
            width={1000}
            height={1000}
          />
        </div>
      </div>
    </div>
  );
} 