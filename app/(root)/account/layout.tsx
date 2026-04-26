export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 p-2">
      <div className="mx-auto max-w-5xl space-y-4">{children}</div>
    </div>
  );
}
