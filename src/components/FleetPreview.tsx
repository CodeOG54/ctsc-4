import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import bmwImage from "@/assets/bmw.jpg";
import suzukiImage from "@/assets/suzuki.jpg";
import mercImage from "@/assets/merc.jpg";
import quantumImage from "@/assets/quantum.jpg";
import coasterImage from "@/assets/coaster.jpg";

export const vehicles = [
  {
    id: "bmw-530d",
    name: "BMW 530D",
    capacity: 3,
    description: "Luxury executive sedan for discerning travelers.",
    image: bmwImage,
    pricePerKm: 1500,
    pricePerHour: null,
    features: ["Air Conditioned", "Roadworthy", "Insured", "Luxury"],
  },
  {
    id: "suzuki-ertiga",
    name: "Suzuki 7 Seater Ertiga",
    capacity: 7,
    description: "Spacious 7-seater van for small groups and families.",
    image: suzukiImage,
    pricePerKm: 800,
    pricePerHour: null,
    features: ["Air Conditioned", "Roadworthy", "Insured", "Towbar"],
  },
  {
    id: "mercedes-viano",
    name: "Mercedes Viano 9 Seater",
    capacity: 9,
    description: "Premium luxury van with exceptional comfort and style.",
    image: mercImage,
    pricePerKm: 1850,
    pricePerHour: null,
    features: ["Air Conditioned", "Roadworthy", "Insured", "Luxury"],
  },
  {
    id: "toyota-quantum",
    name: "Toyota Quantum 14 Seater",
    capacity: 14,
    description: "Spacious multi-seater coach for larger groups and tours.",
    image: quantumImage,
    pricePerKm: 1500,
    pricePerHour: null,
    features: ["Air Conditioned", "Roadworthy", "Insured", "Towbar"],
  },
  {
    id: "toyota-coaster",
    name: "Toyota Coaster 23 Seater",
    capacity: 23,
    description: "Large capacity coach perfect for corporate events and tours.",
    image: coasterImage,
    pricePerKm: 3000,
    pricePerHour: null,
    features: ["Air Conditioned", "Roadworthy", "Insured", "Towbar"],
  },
];

// Display only 3 vehicles in the preview
const previewVehicles = vehicles.slice(0, 3);

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
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            Our Fleet
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Choose Your Ride
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base">
            Explore our premium fleet of vehicles, each meticulously maintained
            and ready to provide you with a comfortable and stylish ride around
            Cape Town.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-2 sm:px-0">
          {previewVehicles.map((vehicle, i) => (
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
                  <h3 className="text-lg font-semibold text-foreground">
                    {vehicle.name}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    <Users className="w-3 h-3" /> {vehicle.capacity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {vehicle.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {vehicle.features?.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-accent">
                    R{vehicle.pricePerKm}
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
