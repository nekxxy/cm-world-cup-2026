import BottomNav from "@/components/nav/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="relative mx-auto w-full max-w-[640px] px-4 pt-safe [--pt:1.25rem] pb-[128px]">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
