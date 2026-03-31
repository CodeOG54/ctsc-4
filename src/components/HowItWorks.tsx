import { motion } from "framer-motion";
import { MapPin, Car, Smile } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Create Your Route",
    description: "Enter your pickup and dropoff locations, or book by the hour for flexible travel.",
  },
  {
    icon: Car,
    title: "Choose Your Vehicle",
    description: "Browse our premium fleet and select the perfect vehicle for your journey.",
  },
  {
    icon: Smile,
    title: "Enjoy The Journey",
    description: "Sit back and relax while our professional drivers get you there safely.",
  },
];

const HowItWorks = () => {
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
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Book in 3 Simple Steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center group"
            >
              <div className="relative mb-6 mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto group-hover:bg-accent/20 transition-colors duration-300">
                  <step.icon className="w-7 h-7 text-accent" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
