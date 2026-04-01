import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Business Executive",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    content:
      "Cape Town Rides has been absolutely fantastic for my business travel needs. The drivers are professional, the vehicles are immaculate, and the service is consistently excellent.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Tourist",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    content:
      "My first experience in Cape Town was made special thanks to the knowledgeable drivers at Cape Town Rides. They shared great local tips while getting me everywhere safely.",
    rating: 5,
  },
  {
    name: "Emma Williams",
    role: "Event Coordinator",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    content:
      "Reliable, punctual, and professional. I've booked Cape Town Rides for multiple corporate events and they've never let me down. Highly recommend!",
    rating: 5,
  },
  {
    name: "James Mandela",
    role: "Tech Founder",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    content:
      "The app is intuitive, the drivers are courteous, and you always feel safe. This is exactly what premium transportation should look like.",
    rating: 5,
  },
  {
    name: "Lisa Anderson",
    role: "Academic Researcher",
    image:
      "https://images.unsplash.com/photo-1487412992651-4d1d655c64e5?w=150&h=150&fit=crop",
    content:
      "Exceptional service from start to finish. The attention to detail and commitment to safety really sets Cape Town Rides apart from competitors.",
    rating: 5,
  },
  {
    name: "David Thompson",
    role: "Travel Writer",
    image:
      "https://images.unsplash.com/photo-1507101105822-7f3b6405be75?w=150&h=150&fit=crop",
    content:
      "After riding with many services worldwide, Cape Town Rides offers a standard of service that's truly world-class. A gem in the city!",
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all duration-300 shadow-sm hover:shadow-lg h-full flex flex-col">
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
      ))}
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic flex-grow">
      "{testimonial.content}"
    </p>
    <div className="flex items-center gap-4 pt-6 border-t border-border mt-auto">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/20"
      />
      <div className="flex-1">
        <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const isMobile = useIsMobile();

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
            Client Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Loved by Our Clients
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base">
            Discover what our valued customers have to say about their
            experience with Cape Town Rides.
          </p>
        </motion.div>

        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={[Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem
                key={testimonial.name}
                className={cn(
                  "pl-4",
                  isMobile ? "basis-[85%]" : "md:basis-1/2 lg:basis-1/3"
                )}
              >
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
