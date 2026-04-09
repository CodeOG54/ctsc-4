import { motion } from "framer-motion";
import { Users, Zap, Shield, Award } from "lucide-react";
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">
            Welcome
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2">
            To Our Fleet
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Showcasing our diverse range of vehicles. From luxury sedans to
            spacious SUVs and versatile vans, each vehicle is well maintained
            and looked after.
          </p>
        </motion.div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-16 px-2 sm:px-0">
          {vehicles.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/50 hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={v.image}
                  alt={v.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={512}
                />
                <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur px-3 py-1 rounded-full">
                  <p className="text-xs font-semibold text-accent-foreground">
                    R{v.pricePerKm}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-foreground">
                    {v.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {v.description}
                  </p>
                </div>

                {/* Capacity */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground">
                      {v.capacity} Seater
                    </span>
                  </span>
                </div>

                {/* Features */}
                <div className="mb-6 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Features
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {v.features?.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-accent/15 text-accent px-2.5 py-1.5 rounded-md font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link to="/book" className="w-full">
                  <Button variant="accent" className="w-full" size="sm">
                    Book Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quality Assurance Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Why Our Fleet Stands Out
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Fully Licensed
              </h3>
              <p className="text-sm text-muted-foreground">
                All vehicles meet legal requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Well Maintained
              </h3>
              <p className="text-sm text-muted-foreground">
                Regular servicing & inspections
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Always Ready
              </h3>
              <p className="text-sm text-muted-foreground">
                24/7 availability for your needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Professional Drivers
              </h3>
              <p className="text-sm text-muted-foreground">
                Courteous & experienced team
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Book Your Ride?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Choose from our premium fleet and experience the Cape Town Rides
            difference today.
          </p>
          <Link to="/book">
            <Button variant="hero" size="lg">
              Book Your Ride Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Fleet;
