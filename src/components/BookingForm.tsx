import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Calendar, Check, ArrowRight, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vehicles } from "@/components/FleetPreview";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const BookingForm = () => {
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<"transfer" | "hourly">("transfer");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickup: "",
    dropoff: "",
    hours: 2,
    date: "",
    time: "",
    vehicleId: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
  const canProceedStep1 = formData.pickup && formData.date && formData.time && (bookingType === "hourly" || formData.dropoff);
  const canProceedStep2 = !!formData.vehicleId;

  const handleConfirm = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to book.", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    const estimatedPrice = selectedVehicle && bookingType === "hourly"
      ? selectedVehicle.pricePerHour * formData.hours
      : null;

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      vehicle_id: formData.vehicleId,
      booking_type: bookingType,
      pickup_location: formData.pickup,
      dropoff_location: bookingType === "transfer" ? formData.dropoff : null,
      hours: bookingType === "hourly" ? formData.hours : null,
      pickup_date: formData.date,
      pickup_time: formData.time,
      estimated_price: estimatedPrice,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking Submitted! 🎉", description: "Your booking is pending confirmation." });
      setStep(1);
      setFormData({ pickup: "", dropoff: "", hours: 2, date: "", time: "", vehicleId: "" });
      navigate("/dashboard");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= s ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-accent" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Create Your Route</h3>
            <div className="flex gap-2 p-1 bg-secondary rounded-xl">
              {(["transfer", "hourly"] as const).map((type) => (
                <button key={type} onClick={() => setBookingType(type)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    bookingType === type ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {type === "transfer" ? "Point-to-Point" : "Book by Hours"}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" /> Pickup Location
                </Label>
                <Input placeholder="e.g. Cape Town International Airport" value={formData.pickup}
                  onChange={(e) => setFormData({ ...formData, pickup: e.target.value })} className="h-12" />
              </div>
              {bookingType === "transfer" ? (
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" /> Drop-off Location
                  </Label>
                  <Input placeholder="e.g. V&A Waterfront Hotel" value={formData.dropoff}
                    onChange={(e) => setFormData({ ...formData, dropoff: e.target.value })} className="h-12" />
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Number of Hours
                  </Label>
                  <Input type="number" min={1} max={24} value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 1 })} className="h-12" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" /> Date
                  </Label>
                  <Input type="date" value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-12" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Time
                  </Label>
                  <Input type="time" value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="h-12" />
                </div>
              </div>
            </div>
            <Button variant="accent" size="lg" className="w-full gap-2" disabled={!canProceedStep1} onClick={() => setStep(2)}>
              Choose Vehicle <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Choose Your Vehicle</h3>
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <button key={vehicle.id} onClick={() => setFormData({ ...formData, vehicleId: vehicle.id })}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    formData.vehicleId === vehicle.id ? "border-accent bg-accent/5 shadow-lg shadow-accent/10" : "border-border hover:border-accent/30"
                  }`}>
                  <img src={vehicle.image} alt={vehicle.name} className="w-24 h-16 object-cover rounded-lg" loading="lazy" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{vehicle.name}</h4>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" /> {vehicle.capacity}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                    <p className="text-sm font-semibold text-accent mt-1">
                      {bookingType === "hourly" ? `R${vehicle.pricePerHour * formData.hours} (${formData.hours}hrs)` : `From R${vehicle.pricePerKm}/km`}
                    </p>
                  </div>
                  {formData.vehicleId === vehicle.id && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="gap-2" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button variant="accent" size="lg" className="flex-1 gap-2" disabled={!canProceedStep2} onClick={() => setStep(3)}>
                Review Booking <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Confirm Booking</h3>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                {selectedVehicle && (
                  <>
                    <img src={selectedVehicle.image} alt={selectedVehicle.name} className="w-20 h-14 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-semibold text-foreground">{selectedVehicle.name}</h4>
                      <p className="text-sm text-muted-foreground">Up to {selectedVehicle.capacity} passengers</p>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-foreground">{bookingType === "hourly" ? "Hourly Booking" : "Transfer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="font-medium text-foreground">{formData.pickup}</span>
                </div>
                {bookingType === "transfer" ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Drop-off</span>
                    <span className="font-medium text-foreground">{formData.dropoff}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{formData.hours} hours</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium text-foreground">{formData.date} at {formData.time}</span>
                </div>
                {selectedVehicle && bookingType === "hourly" && (
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-semibold text-foreground">Estimated Total</span>
                    <span className="font-bold text-accent text-lg">R{selectedVehicle.pricePerHour * formData.hours}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="gap-2" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button variant="hero" size="lg" className="flex-1" onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Submitting..." : "Confirm Booking"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingForm;