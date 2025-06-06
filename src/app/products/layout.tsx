import LayoutPage from "@/components/ui/layout";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full ">
      <LayoutPage>{children}</LayoutPage>
    </div>
  );
}
