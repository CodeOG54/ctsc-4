import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ServicePageProps {
  title: string;
  subtitle: string;
  description: string[];
  features: string[];
}

const ServicePage = ({ title, subtitle, description, features }: ServicePageProps) => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">{subtitle}</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2 mb-6">{title}</h1>
          {description.map((p, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
          ))}
          <ul className="space-y-3 my-8">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-foreground">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                {f}
              </li>
            ))}
          </ul>
          <Link to="/book">
            <Button variant="hero" size="lg" className="gap-2">
              Book Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
    <Footer />
  </div>
);

export const AirportTransfers = () => (
  <ServicePage
    title="Airport Transfers"
    subtitle="Reliable & Punctual"
    description={[
      "Never miss a flight again. Our airport transfer service ensures you arrive at Cape Town International Airport on time, every time.",
      "We monitor flight schedules in real-time and adjust pickup times accordingly, so you're always covered — even when plans change.",
    ]}
    features={["Meet & greet service", "Flight tracking", "24/7 availability", "Fixed pricing — no surprises", "Complimentary waiting time"]}
  />
);

export const ChauffeurServices = () => (
  <ServicePage
    title="Chauffeur Services"
    subtitle="Your Personal Driver"
    description={[
      "Have a professional chauffeur at your disposal for business meetings, wine tours, special events, or simply exploring Cape Town in style.",
      "Book by the hour and enjoy the flexibility of having a dedicated driver who knows the city inside and out.",
    ]}
    features={["Hourly booking", "Professional, vetted drivers", "Corporate accounts available", "Multilingual drivers", "Luxury vehicles"]}
  />
);

export const PointToPoint = () => (
  <ServicePage
    title="Point-to-Point Transfers"
    subtitle="Direct & Efficient"
    description={[
      "Need to get from A to B? Our point-to-point transfer service offers direct, no-fuss transport anywhere in the greater Cape Town area.",
      "From the Winelands to the Waterfront, we've got you covered with competitive pricing and premium comfort.",
    ]}
    features={["Door-to-door service", "Competitive pricing", "No detours", "Available 7 days a week", "Large group options"]}
  />
);
