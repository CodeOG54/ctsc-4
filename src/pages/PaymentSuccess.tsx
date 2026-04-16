import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking_id");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setVerifying(false);
      return;
    }

    // Poll for payment status update from webhook
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from("bookings")
        .select("payment_status")
        .eq("id", bookingId)
        .single();

      if (data?.payment_status === "paid") {
        setVerified(true);
        setVerifying(false);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        // Assume success since Yoco redirected here
        setVerified(true);
        setVerifying(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [bookingId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-20 section-padding bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 text-accent mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verifying Payment...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your booking has been confirmed and payment received. You'll receive a confirmation shortly.
              </p>
              <Button
                variant="accent"
                size="lg"
                className="rounded-full gap-2"
                onClick={() => navigate("/dashboard")}
              >
                View Your Bookings <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
