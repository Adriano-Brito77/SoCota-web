import LayoutPage from "@/components/ui/layout";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutPage>
      <main>{children}</main>
    </LayoutPage>
  );
}
