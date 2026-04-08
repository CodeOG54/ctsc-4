import { motion } from "framer-motion";
import { Star, Quote, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

const testimonials = [
  {
    name: "Maneesha Sookenram",
    content:
      "Awesome as usual. Very reliable. Good vehicles.  Drivers are very polite and helpful. Garth and Enrico were great. Last year also they did our transfer.  This year we even rented a car from them. Special mention to Nikita who assisted us and helped with all our requests. Highly recommended.",
    rating: 5,
  },
  {
    name: "Ana Jovanovic",
    content:
      "We had a wonderful experience with this company. We loved our driver Mbombo who was a great guide, showed us Cape Town and took an extra step and went over and beyond! Thanks for everything, we will hire you again!",
    rating: 5,
  },
  {
    name: "Cloe Smith",
    content:
      "Fabulous service - great comms from Tracy and a superb driving experience from Enrico. Thank you!",
    rating: 5,
  },
  {
    name: "Edward Keown",

    content:
      "The pickup was precisely on time. The ride was smooth and we were on time for book-in. Can highly recommend this service! Can’t wait for my next trip!",
    rating: 5,
  },
  {
    name: "Jason Bagley",
    content:
      "Garth was our driver for the afternoon and did a great job. Was in constant communication and on time for both collection and drop off.",
    rating: 5,
  },
  {
    name: "Ivan Kakolo",
    content:
      "Awesome service😊👌, friendly drivers they are always in time and clean cars, our tour was just amazing.",
    rating: 5,
  },
];

const TestimonialCard = ({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) => (
  <div className="relative p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col group overflow-hidden">
    {/* Decorative quote */}
    <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/10 group-hover:text-accent/20 transition-colors duration-300" />

    {/* Author info at top */}
    <div className="flex items-center gap-3 mb-5">
      <div className="w-12 h-12 rounded-full bg-accent/20 ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all duration-300 flex items-center justify-center text-accent font-semibold text-sm">
        {getInitials(testimonial.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">
          {testimonial.name}
        </p>
      </div>
    </div>

    {/* Rating */}
    <div className="flex gap-0.5 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
      ))}
    </div>

    {/* Content */}
    <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
      "{testimonial.content}"
    </p>

    {/* Route tag */}
    {/* <div className="mt-5 pt-4 border-t border-border">
      <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
        <MapPin className="w-3 h-3" />
        <span>{testimonial.route}</span>
      </div>
    </div> */}
  </div>
);

const Testimonials = () => {
  const isMobile = useIsMobile();

  return (
    <section className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 mb-4">
            <Star className="w-3 h-3 fill-accent" />
            Trusted by Travelers
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            What Our Riders Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-sm sm:text-base">
            Real experiences from passengers across Cape Town who trust us with
            their daily commutes, airport transfers, and special journeys.
          </p>
        </motion.div>

        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={[
            Autoplay({
              delay: 3500,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
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

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          {[
            { value: "4.8★", label: "Average Rating" },
            { value: "1,000+", label: "Happy Riders" },
            { value: "5,000+", label: "Trips Completed" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-accent">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
