export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-5 pt-safe pb-safe [--pb:1.5rem] [--pt:1.5rem]">
      {children}
    </main>
  );
}
