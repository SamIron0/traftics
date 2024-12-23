import Image from "next/image";
const integrations = [
  {
    src: "/integrations/ga.svg",
    alt: "Google Analytics",
  },
  {
    src: "/integrations/shopify.svg",
    alt: "Shopify",
  },
  {
    src: "/integrations/wordpress.svg",
    alt: "WordPress",
  },
];

export default function IntegrationsSection() {
  return (
    <div className="py-20 space-y-8">
      {/* Trust Metrics Heading */}
      <h2 className="text-2xl sm:text-3xl font-medium text-center">
        Integrates with your favorite tools
      </h2>

      {/* Logo Cloud */}
      <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
        {integrations.map((integration, i) => (
          <div key={i} className="relative w-[120px] h-[40px]">
            <Image
              src={integration.src}
              alt={integration.alt}
              fill
              className="object-contain filter grayscale opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
