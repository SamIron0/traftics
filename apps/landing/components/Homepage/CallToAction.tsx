import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function CallToActionSection() {
  const features = [
    "Session recordings with advanced analytics",
    "Real-time user behavior tracking",
    "Customizable dashboards",
    "Integration with popular platforms",
    "Unlimited team members",
  ];

  return (
    <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[45fr_55fr] items-start">
      {/* Left Column - Text & CTAs */}
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-8">
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
          Start understanding your users today
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg">
          Get instant access to powerful analytics and user behavior insights.
          Start with our free plan and upgrade as you grow.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" size="lg" className="text-md h-11">
            View pricing
          </Button>
          <Button size="lg" className="text-md h-11 bg-zinc-900 text-zinc-50">
            Start for free
          </Button>
        </div>
      </div>

      {/* Right Column - Features */}
      <div className="lg:pl-12">
        <div className="bg-background rounded-2xl p-8 border">
          <h3 className="text-xl font-medium mb-8">
            Everything you need to get started
          </h3>
          <ul className="space-y-5">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}