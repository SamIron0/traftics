import { AppWrapper } from "@/components/AppWrapper";

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col ">
      <AppWrapper>{children} </AppWrapper>
    </div>
  );
}
