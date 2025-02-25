export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col ">{children}</div>;
}
