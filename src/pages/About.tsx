import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-32 section-padding">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">About Us</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2 mb-6">Cape Town Shuttle Services</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            We are Cape Town's premier shuttle and transport company, dedicated to providing safe, reliable, and luxurious travel experiences across the Mother City and beyond.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            With a fleet of meticulously maintained vehicles and a team of professional, vetted drivers, we ensure every journey is comfortable, punctual, and stress-free — whether you're heading to the airport, exploring the Winelands, or attending a corporate event.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our commitment to excellence, transparency, and customer satisfaction has made us a trusted name in Cape Town transport since day one.
          </p>
        </motion.div>
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
