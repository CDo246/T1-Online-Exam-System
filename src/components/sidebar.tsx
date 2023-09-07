interface SidebarChildren {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarChildren) {
  return <div className="flex flex-col bg-white p-5">{children}</div>;
}
