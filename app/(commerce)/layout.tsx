export default function CommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>커머스 네비게이션</nav>
      {children}
    </div>
  );
}
