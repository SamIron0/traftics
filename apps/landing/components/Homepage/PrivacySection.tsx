import { ShieldCheck } from "lucide-react";
export default function PrivacySection() {
  return (
    <div>
      <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4">
        Privacy focused by design
      </h2>
      <p className="text-lg  text-muted-foreground px-4 sm:max-w-xl mx-auto">
        Build trust with your users while gaining the insights you need.
      </p>

      <div className="container px-4 md:px-6 mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          <div className="flex flex-col items-start space-y-4">
            <div className="inline-block rounded-lg bg-gray-100 p-2">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold">Data Masking</h3>
            <p className="text-gray-500 text-left max-w-xs">
              We do not record sensitive data like passwords, credit card
              numbers, or any other personal identifiable information during recording.
            </p>
          </div>
          <div className="flex flex-col items-start space-y-4">
            <div className="inline-block rounded-lg bg-gray-100 p-2">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold">GDPR</h3>
            <p className="text-gray-500 text-left max-w-xs">
              Stay fully compliant with global privacy GDPR laws when you use
              our platform.
            </p>
          </div>
          <div className="flex flex-col items-start space-y-4">
            <div className="inline-block rounded-lg bg-gray-100 p-2">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold"> CCPA compliant</h3>
            <p className="text-gray-500 text-left max-w-xs">
              Stay fully compliant with global privacy CCPA laws when you use
              our platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
