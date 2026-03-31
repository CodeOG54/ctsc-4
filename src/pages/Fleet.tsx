import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { vehicles } from "@/components/FleetPreview";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Fleet = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-32 section-padding">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">Our Fleet</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2">Premium Vehicles</h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Every vehicle in our fleet is meticulously maintained and equipped for your comfort.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {vehicles.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl transition-all duration-300 group">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={512} />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{v.name}</h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full"><Users className="w-3 h-3" /> {v.capacity}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{v.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-accent font-semibold">R{v.pricePerKm}/km</span>
                  <span className="text-muted-foreground">R{v.pricePerHour}/hr</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/book"><Button variant="hero" size="lg">Book Your Ride</Button></Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Fleet;
