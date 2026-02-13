export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>관리자 네비게이션</nav>
      {children}
    </div>
  );
}
