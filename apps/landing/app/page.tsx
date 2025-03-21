"use client";
import { Rocket, Router } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoDemo from "@/components/Homepage/VideoDemo";
import FeaturesSection from "@/components/Homepage/FeaturesSection";
import CallToActionSection from "@/components/Homepage/CallToAction";
import PrivacySection from "@/components/Homepage/PrivacySection";
import WhySection from "@/components/Homepage/WhySection";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <div className="">
        <section className="grid max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 lg:grid-cols-[48fr_52fr] gap-12 items-center">
          <div className="text-center order-first lg:text-left">
            <h1 className="text-4xl sm:text-5xl max-w-2xl mx-auto font-medium tracking-tight mb-4">
              Record and Replay interactions you{" "}
              <span className="text-primary"> need </span> to see.
            </h1>
            <p className="text-lg sm:text-[21px] max-w-sm sm:max-w-md mx-auto lg:mx-0 text-muted-foreground mb-12">
              Automatically analyze all sessions recordings and surface only
              those that provide valuable insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                variant="outline"
                size="sm"
                className="text-md h-10 px-12"
                onClick={() =>
                  router.push("https://traftics.ironkwe.com/signup")
                }
              >
                Get started
              </Button>
              <Button
                size="sm"
                className="text-md h-10 px-5 bg-zinc-900 text-zinc-50"
                onClick={() =>
                  router.push(
                    "https://traftics.ironkwe.com/org/remeal/project/project-4fd62621/dashboards/89ddb53f-f040-4c64-9bfe-52930fac6fd7"
                  )
                }
              >
                <Rocket className="mr-1 h-4 w-4" />
                View the demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <VideoDemo />
          </div>
        </section>
        <section className="mt-24 sm:mt-32 max-w-7xl mx-auto px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4">
              Powerful features to understand your users
            </h2>
            <p className="text-lg text-muted-foreground px-4 sm:max-w-2xl mx-auto">
              From session recordings to analytics, get all the tools you need
              to make data-driven decisions and improve your user experience.
            </p>
          </div>
          <div className="sm:mx-auto w-full bg-muted rounded-2xl flex flex-col items-center pt-5 lg:p-4 border">
            <FeaturesSection />
          </div>
        </section>
        <div className="py-20 w-full flex flex-col items-center">
          <Button
            onClick={() => router.push("https://traftics.ironkwe.com/login")}
            variant="secondary"
            className="px-8 py-7 text-lg"
          >
            Get started for free
          </Button>
        </div>
        <div className="w-full flex flex-col items-center px-8 py-8">
          <div className="text-center mb-12">
            <PrivacySection />
          </div>
        </div>
        <div className="mt-12 w-full flex flex-col items-center px-8 py-8">
          <div className="text-center mb-12">
            <WhySection />
          </div>
        </div>
        <div className="mt-12 w-full bg-muted flex flex-col items-center px-8 py-8">
          <CallToActionSection />
        </div>
      </div>
    </>
  );
}
