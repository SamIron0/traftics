import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const avatars = [
  {
    src: "https://github.com/SamIron0.png",
    alt: "Dan Abramov",
  },
  {
    src: "https://github.com/SamIron0.png",
    alt: "Paul Graham",
  },
  {
    src: "https://github.com/SamIron0.png",
    alt: "Chris Messina",
  },
  {
    src: "https://github.com/SamIron0.png",
    alt: "John Carmack",
  },
  {
    src: "https://github.com/SamIron0.png",
    alt: "Ryan Dahl",
  },
];

export default function TestimonialSection() {
  return (
    <div className="relative">
      <div className="flex flex-row items-center justify-center lg:justify-start gap-8">
        {/* Avatar Stack */}
        <div className="flex -space-x-3">
          {avatars.map((avatar, i) => (
            <div
              key={i}
              className="relative ring-2 ring-background rounded-full"
            >
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={avatar.src} alt={avatar.alt} />
                <AvatarFallback>
                  {avatar.alt
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>

        {/* Rating and Text */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              4.9/5
            </span>
          </div>
          <p className="text-md text-left">
            <strong className="text-foreground font-medium">1,000+</strong>{" "}
            <span className="text-muted-foreground">
              websites trust Traftics
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
