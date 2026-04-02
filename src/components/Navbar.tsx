import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, LogOut, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useDriverCheck } from "@/hooks/useDriverCheck";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  {
    label: "Services",
    path: "/services",
    children: [
      { label: "Airport Transfers", path: "/services/airport-transfers" },
      { label: "Chauffeur Services", path: "/services/chauffeur" },
      { label: "Point-to-Point", path: "/services/point-to-point" },
    ],
  },
  { label: "Fleet", path: "/fleet" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-4 right-4 z-50 glass rounded-2xl"
    >
      <nav className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="CTSC Travel" className="h-8 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  to={link.path!}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? "text-foreground bg-secondary"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <ChevronDown className="w-3.5 h-3.5" />
                </Link>
                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-56 glass rounded-xl p-2"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path!}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? "text-foreground bg-secondary"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/book" className="hidden sm:block">
            <Button variant="accent" size="sm">
              Book Now
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-accent hover:text-primary"
                  >
                    <Shield className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/70 hover:text-foreground"
                >
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-foreground"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <button
            className="lg:hidden text-foreground/70 hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden border-t border-border/50"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="flex items-center">
                      <Link
                        to={link.path!}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground rounded-lg"
                      >
                        {link.label}
                      </Link>
                      <button
                        onClick={() => setServicesOpen(!servicesOpen)}
                        className="px-4 py-2.5 text-foreground/80 hover:text-foreground"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                    {servicesOpen && (
                      <div className="ml-4 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-2 text-sm text-foreground/60 hover:text-foreground rounded-lg"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path!}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground rounded-lg"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <Link to="/book" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" className="w-full mt-2">
                  Book Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
