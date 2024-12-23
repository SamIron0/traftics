import React from 'react';
import { Newspaper } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
}
const FeatureCard = ({ title, description }: FeatureCardProps) => (
  <div className="bg-zinc-300 rounded-3xl p-9 flex flex-row">
    <div className="max-w-2xl gap-28 text-left justify-between h-full flex flex-col">
      <h1 className="text-2xl leading-[1.2] font-medium tracking-tight text-gray-900 mb-6">
        {title}
      </h1>
      <p className="text-lg text-gray-600 font-normal leading-normal">
        {description}
      </p>
    </div>
    <div>
      <Newspaper className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
    </div>
  </div>
);

const WhySection = () => (
  <div>
    <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-8">
      Why choose Traftics?
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-7xl mx-auto">
      <FeatureCard
        title="Smarter Prioritization = Faster Insights"
        description="Our priority engine ensures you're always looking at the most impactful sessions, saving time and improving outcomes."
      />
      <FeatureCard
        title="Seamless Integration"
        description="Just copy and paste our script into your website's header, and you're live in minutes. No coding expertise required."
      />
      <FeatureCard
        title="Built for Scalability"
        description="Whether you're managing a small website or a high-traffic platform, our system is optimized for speed and performance."
      />
      <FeatureCard
        title="Backed by Experts"
        description="Developed by marketers and product experts who understand the challenges of growing a website."
      />
    </div>
  </div>
);

export default WhySection;
