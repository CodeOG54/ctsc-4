import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">CT</span>
              </div>
              <span className="font-bold text-lg">Cape Town Shuttle</span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Premium shuttle and transport services across the Cape Town area.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", path: "/" },
                { label: "About", path: "/about" },
                { label: "Fleet", path: "/fleet" },
                { label: "Book Now", path: "/book" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {[
                { label: "Airport Transfers", path: "/services/airport-transfers" },
                { label: "Chauffeur Services", path: "/services/chauffeur" },
                { label: "Point-to-Point", path: "/services/point-to-point" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Phone className="w-4 h-4 text-accent" /> 021 300 5297
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Phone className="w-4 h-4 text-accent" /> 083 766 8601
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Mail className="w-4 h-4 text-accent" /> info@shuttlecapetown.co.za
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/60">
                <MapPin className="w-4 h-4 text-accent mt-0.5" />384 Voortrekker Rd, Maitland, Cape Town
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} Shuttle Cape Town. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
