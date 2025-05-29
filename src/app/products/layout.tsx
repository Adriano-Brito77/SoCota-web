import LayoutPage from "@/components/ui/layout";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full ">
      <LayoutPage>{children}</LayoutPage>
    </div>
  );
}
