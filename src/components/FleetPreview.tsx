import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import vehicleSedan from "@/assets/vehicle-sedan.jpg";
import vehicleSuv from "@/assets/vehicle-suv.jpg";
import vehicleVan from "@/assets/vehicle-van.jpg";

export const vehicles = [
  {
    id: "sedan",
    name: "Executive Sedan",
    capacity: 3,
    description: "Perfect for business travelers and couples seeking comfort.",
    image: vehicleSedan,
    pricePerKm: 15,
    pricePerHour: 350,
  },
  {
    id: "suv",
    name: "Luxury SUV",
    capacity: 5,
    description: "Spacious and powerful, ideal for families and groups.",
    image: vehicleSuv,
    pricePerKm: 22,
    pricePerHour: 500,
  },
  {
    id: "van",
    name: "Premium Sprinter",
    capacity: 12,
    description: "Ultimate space for large groups, events, and tours.",
    image: vehicleVan,
    pricePerKm: 30,
    pricePerHour: 700,
  },
];

const FleetPreview = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">Our Fleet</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Choose Your Ride
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {vehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={512}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{vehicle.name}</h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    <Users className="w-3 h-3" /> {vehicle.capacity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{vehicle.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-accent">
                    From R{vehicle.pricePerKm}/km
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/fleet">
            <Button variant="outline" size="lg" className="gap-2">
              View Full Fleet <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FleetPreview;
