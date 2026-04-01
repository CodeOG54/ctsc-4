import { motion } from "framer-motion";
import { Shield, Zap, Users, MapPin, Leaf, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const reasons = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "All drivers are thoroughly vetted and trained. Your security is our top priority with real-time tracking and 24/7 support.",
  },
  {
    icon: Zap,
    title: "Professional Fleet",
    description:
      "Premium vehicles maintained to the highest standards. Clean, comfortable, and equipped with modern amenities for every journey.",
  },
  {
    icon: Users,
    title: "Expert Drivers",
    description:
      "Courteous, experienced drivers who know Cape Town thoroughly. Professional service with a personal touch every time.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "Deep knowledge of Cape Town's roads and neighborhoods. We navigate the city efficiently to get you where you need to be.",
  },
  {
    icon: Leaf,
    title: "Eco-Conscious",
    description:
      "Committed to sustainable transport with modern vehicles offering better fuel efficiency and reduced emissions.",
  },
  {
    icon: Award,
    title: "Trusted & Certified",
    description:
      "Licensed, insured, and recognized for excellence. Years of satisfied customers across Cape Town trusting us with their journeys.",
  },
];

const WhyUs = () => {
  return (
    <section className="bg-background">
      <div className="section-padding container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            The Cape Town Rides Difference
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base">
            Experience premium transportation with safety, reliability, and
            professionalism at every turn.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="p-8 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                <reason.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Full-width CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-16 py-12 px-4 bg-gradient-to-r from-accent/10 via-accent/15 to-accent/10 border-y border-accent/20"
      >
        <div className="text-center max-w-3xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Ready to Experience the Difference?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied travelers who trust Cape Town Rides
            for their transportation needs.
          </p>
          <Link to="/book" className="hidden sm:inline-block mt-6">
            <Button variant="hero" size="sm">
              Book Now
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default WhyUs;
