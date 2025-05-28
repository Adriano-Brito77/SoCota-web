import LayoutPage from "@/components/ui/layout";

export default function QuotationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <LayoutPage>{children}</LayoutPage>
    </div>
  );
}
