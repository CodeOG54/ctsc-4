import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plane,
  Crown,
  ArrowRightLeft,
  ArrowRight,
  Building2,
  Briefcase,
} from "lucide-react";

const services = [
  {
    icon: Plane,
    title: "Airport Transfers",
    description:
      "Reliable pickup and drop-off to and from Cape Town International Airport.",
    path: "/services/airport-transfers",
  },
  {
    icon: Crown,
    title: "Chauffeur Services",
    description:
      "Professional chauffeur at your disposal for business or leisure.",
    path: "/services/chauffeur",
  },
  {
    icon: ArrowRightLeft,
    title: "Point-to-Point",
    description:
      "Direct transfers between any two locations in the Cape Town area.",
    path: "/services/point-to-point",
  },
  {
    icon: Building2,
    title: "Employee Transportation",
    description:
      "Daily corporate commute solutions to keep your workforce on time.",
    path: "/services/employee-transportation",
  },
  {
    icon: Briefcase,
    title: "Staff Shuttle Service",
    description:
      "Shift-aligned group transport for teams of every size and schedule.",
    path: "/services/staff-shuttle",
  },
];

const ServicesOverview = () => {
  return (
    <section className="section-padding bg-secondary/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Premium Transport Solutions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base">
            We offer a wide range of services to meet your transportation needs,
            from airport transfers to chauffeur services and point-to-point
            transfers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={service.path}
                className="block h-full p-8 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-accent gap-1 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
