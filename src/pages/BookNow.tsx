import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";

const BookNow = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="pt-32 section-padding">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-sm font-semibold tracking-wider uppercase text-accent">Booking</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-2">Book Your Ride</h1>
        </motion.div>
        <BookingForm />
      </div>
    </div>
    <Footer />
  </div>
);

export default BookNow;
