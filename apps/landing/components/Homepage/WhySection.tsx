import { Brain, Download, LineChart, Scale, Users } from 'lucide-react';
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-gray-200 group hover:bg-gray-200/60 hover:rotate-2 hover:scale-102 rounded-3xl p-9 flex flex-row">
    <div className="max-w-2xl gap-28 text-left justify-between h-full flex flex-col">
      <h1 className="text-2xl leading-[1.2] font-medium tracking-tight text-gray-900 mb-6">
        {title}
      </h1>
      <p className="text-lg text-gray-600 font-normal leading-normal">
        {description}
      </p>
    </div>
    <div className="transition-transform duration-300 ease-in-out group-hover:rotate-6 group-hover:scale-110">
      {icon}
    </div>
  </div>
);

const WhySection = () => (
  <div>
    <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-8">
      Why choose Traftics?
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto">
      <FeatureCard
        title="Smarter Prioritization = Faster Insights"
        description="Our priority engine ensures you're always looking at the most impactful sessions, saving time and improving outcomes."
        icon= {<Brain className="h-6 w-6" />}
      />
      <FeatureCard
        title="Seamless Integration"
        description="Just copy and paste our script into your website's header, and you're live in minutes. No coding expertise required."
        icon= {<Download className="h-6 w-6" />}
      />
      <FeatureCard
        title="Built for Scalability"
        description="Whether you're managing a small website or a high-traffic platform, our system is optimized for speed and performance."
        icon= {<LineChart className="h-6 w-6" />}
      />
      <FeatureCard
        title="Backed by Experts"
        description="Developed by marketers and product experts who understand the challenges of growing a website."
        icon= {<Users className="h-6 w-6" />}
      />
    </div>
  </div>
);

export default WhySection;
