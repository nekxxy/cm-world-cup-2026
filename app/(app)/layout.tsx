import CinematicNav from "@/components/nav/CinematicNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CinematicNav />
      <main className="relative mx-auto w-full max-w-[680px] px-4 pb-20 pt-[calc(env(safe-area-inset-top)+5.25rem)]">
        {children}
      </main>
    </>
  );
}
