import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Truck, LogOut, ChevronLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";

const sidebarLinks = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Drivers", path: "/admin/drivers", icon: Users },
  { label: "Fleet", path: "/admin/fleet", icon: Truck },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card hidden lg:flex flex-col">
        <div className="p-5 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="CTSC Travel" className="h-8 w-auto" />
            <span className="font-bold text-foreground text-sm">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border/50 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent/10 text-accent text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground rounded-xl text-sm" onClick={() => navigate("/")}>
            <ChevronLeft className="w-4 h-4" /> Back to Site
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground rounded-xl text-sm" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile + Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="CTSC Travel" className="h-7 w-auto" />
            <span className="font-bold text-sm text-foreground">Admin</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-foreground/70 hover:text-foreground">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border/50 bg-card p-3 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground rounded-xl" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>
                <ChevronLeft className="w-4 h-4" /> Back to Site
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive rounded-xl" onClick={async () => { await signOut(); navigate("/"); }}>
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
