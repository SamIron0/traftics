export default function SignupConfirmPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We've sent you a confirmation link. Please check your email and click
              the link to activate your account.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, check your spam folder.
            </p>
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