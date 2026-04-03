import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Clock, Navigation, CheckCircle, PlayCircle,
  ArrowRight, Car, MessageSquare, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useDriverCheck } from "@/hooks/useDriverCheck";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface DriverBooking {
  id: string;
  user_id: string;
  pickup_location: string;
  dropoff_location: string | null;
  pickup_date: string;
  pickup_time: string;
  status: string;
  service_type: string;
  notes: string | null;
  price_estimate: number | null;
  vehicles?: { name: string } | null;
  customer_name?: string;
}

interface Profile {
  id: string;
  full_name: string | null;
}

const statusFlow = [
  { from: "approved", to: "driver_assigned", label: "Accept Trip", icon: CheckCircle, color: "text-blue-600 border-blue-500/30 hover:bg-blue-500/10" },
  { from: "driver_assigned", to: "on_the_way", label: "On The Way", icon: Navigation, color: "text-orange-600 border-orange-500/30 hover:bg-orange-500/10" },
  { from: "on_the_way", to: "arrived", label: "Arrived", icon: MapPin, color: "text-purple-600 border-purple-500/30 hover:bg-purple-500/10" },
  { from: "arrived", to: "in_progress", label: "Start Trip", icon: PlayCircle, color: "text-accent border-accent/30 hover:bg-accent/10" },
  { from: "in_progress", to: "completed", label: "Complete Trip", icon: CheckCircle, color: "text-green-600 border-green-500/30 hover:bg-green-500/10" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  approved: "bg-blue-500/10 text-blue-600",
  driver_assigned: "bg-indigo-500/10 text-indigo-600",
  on_the_way: "bg-orange-500/10 text-orange-600",
  arrived: "bg-purple-500/10 text-purple-600",
  in_progress: "bg-accent/10 text-accent",
  completed: "bg-green-500/10 text-green-600",
  cancelled: "bg-destructive/10 text-destructive",
};

const DriverDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDriver, driverId, loading: driverLoading } = useDriverCheck();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<DriverBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !driverLoading) {
      if (!user) navigate("/auth");
      else if (!isDriver) navigate("/dashboard");
    }
  }, [user, isDriver, authLoading, driverLoading, navigate]);

  const fetchBookings = async () => {
    if (!driverId) return;

    const [bookingsRes, profilesRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, user_id, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, status, price_estimate, notes, created_at, updated_at, vehicles:vehicle_id(name)")
        .eq("driver_id", driverId)
        .in("status", ["approved", "driver_assigned", "on_the_way", "arrived", "in_progress", "completed"])
        .order("pickup_date", { ascending: true }),
      supabase.from("profiles").select("id, full_name"),
    ]);

    const profileMap = new Map<string, string>();
    (profilesRes.data as Profile[] || []).forEach(p => {
      if (p.full_name) profileMap.set(p.id, p.full_name);
    });

    const enriched = ((bookingsRes.data as DriverBooking[]) || []).map(b => ({
      ...b,
      customer_name: profileMap.get(b.user_id) || "Customer",
    }));

    setBookings(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (!driverId) return;
    fetchBookings();

    const channel = supabase
      .channel("driver-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `driver_id=eq.${driverId}` },
        () => fetchBookings()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driverId]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setUpdatingId(null);
  };

  const openInMaps = (pickup: string, dropoff?: string | null) => {
    const origin = encodeURIComponent(pickup);
    if (dropoff) {
      const dest = encodeURIComponent(dropoff);
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${origin}`, "_blank");
    }
  };

  if (authLoading || driverLoading || !isDriver) return null;

  const today = new Date().toISOString().split("T")[0];
  const todayTrips = bookings.filter(b => b.pickup_date === today && b.status !== "completed");
  const upcomingTrips = bookings.filter(b => b.pickup_date > today && b.status !== "completed");
  const completedTrips = bookings.filter(b => b.status === "completed");
  const activeTrips = bookings.filter(b => ["on_the_way", "arrived", "in_progress"].includes(b.status));

  const TripCard = ({ booking }: { booking: DriverBooking }) => {
    const action = statusFlow.find(s => s.from === booking.status);
    const isUpdating = updatingId === booking.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card border border-border p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[booking.status] || ""}`}>
            {booking.status.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace(/_/g, " ")}</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <span className="text-sm font-medium text-foreground">{booking.pickup_location}</span>
          </div>
          {booking.dropoff_location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm font-medium text-foreground">{booking.dropoff_location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.pickup_date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.pickup_time}</span>
          <span className="flex items-center gap-1">👤 {booking.customer_name}</span>
        </div>

        {booking.vehicles?.name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Car className="w-3 h-3" /> {booking.vehicles.name}
          </div>
        )}

        {booking.notes && (
          <div className="flex items-start gap-2 bg-secondary/50 rounded-lg p-2.5">
            <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{booking.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1 flex-1"
            onClick={() => openInMaps(booking.pickup_location, booking.dropoff_location)}
          >
            <Navigation className="w-3 h-3" /> Open in Maps
          </Button>

          {action && (
            <Button
              variant="outline"
              size="sm"
              className={`text-xs gap-1 flex-1 ${action.color}`}
              onClick={() => updateStatus(booking.id, action.to)}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <action.icon className="w-3 h-3" />}
              {action.label}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 section-padding">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
            <p className="text-muted-foreground mt-1 mb-8">Manage your assigned trips</p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: "Today", value: todayTrips.length },
                { label: "Active", value: activeTrips.length },
                { label: "Completed", value: completedTrips.length },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-card border border-border p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-40 rounded-xl bg-secondary animate-pulse" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-card border border-border">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No trips assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Today's Trips */}
                {todayTrips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent" /> Today's Trips
                    </h2>
                    <div className="space-y-3">
                      {todayTrips.map(b => <TripCard key={b.id} booking={b} />)}
                    </div>
                  </div>
                )}

                {/* Upcoming Trips */}
                {upcomingTrips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3">Upcoming Trips</h2>
                    <div className="space-y-3">
                      {upcomingTrips.map(b => <TripCard key={b.id} booking={b} />)}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {completedTrips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3">Completed</h2>
                    <div className="space-y-3">
                      {completedTrips.map(b => <TripCard key={b.id} booking={b} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverDashboard;
