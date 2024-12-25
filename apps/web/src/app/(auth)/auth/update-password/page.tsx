import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Update your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Please enter your new password below
            </p>
          </div>
          <div className="mt-8">
            <UpdatePasswordForm />
          </div>
        </div>
      </div>

      {/* Right Column - Image/Gradient */}
      <div className="hidden md:block relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center mix-blend-overlay" />
      </div>
    </div>
  );
} 