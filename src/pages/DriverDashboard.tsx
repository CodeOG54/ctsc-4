import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Clock, Navigation, CheckCircle, PlayCircle,
  Car, MessageSquare, Loader2, Activity, CalendarCheck, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useDriverCheck } from "@/hooks/useDriverCheck";
import AuthNavbar from "@/components/AuthNavbar";

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
  { from: "approved", to: "driver_assigned", label: "Accept Trip", icon: CheckCircle, color: "bg-blue-600 hover:bg-blue-700 text-white" },
  { from: "driver_assigned", to: "on_the_way", label: "On The Way", icon: Navigation, color: "bg-orange-600 hover:bg-orange-700 text-white" },
  { from: "on_the_way", to: "arrived", label: "Arrived", icon: MapPin, color: "bg-purple-600 hover:bg-purple-700 text-white" },
  { from: "arrived", to: "in_progress", label: "Start Trip", icon: PlayCircle, color: "bg-accent hover:bg-accent/90 text-accent-foreground" },
  { from: "in_progress", to: "completed", label: "Complete Trip", icon: CheckCircle, color: "bg-green-600 hover:bg-green-700 text-white" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  driver_assigned: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  on_the_way: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  arrived: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  in_progress: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
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
    (profilesRes.data as Profile[] || []).forEach(p => { if (p.full_name) profileMap.set(p.id, p.full_name); });
    const enriched = ((bookingsRes.data as unknown as DriverBooking[]) || []).map(b => ({
      ...b, customer_name: profileMap.get(b.user_id) || "Customer",
    }));
    setBookings(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (!driverId) return;
    fetchBookings();
    const channel = supabase
      .channel("driver-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `driver_id=eq.${driverId}` }, () => fetchBookings())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [driverId]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from("bookings").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) console.error("Driver status update error:", error);
    else await fetchBookings();
    setUpdatingId(null);
  };

  const openInMaps = (pickup: string, dropoff?: string | null) => {
    const origin = encodeURIComponent(pickup);
    if (dropoff) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodeURIComponent(dropoff)}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${origin}`, "_blank");
    }
  };

  if (authLoading || driverLoading || !isDriver) return null;

  const today = new Date().toISOString().split("T")[0];
  const todayTrips = bookings.filter(b => b.pickup_date === today && b.status !== "completed");
  const activeTrips = bookings.filter(b => ["on_the_way", "arrived", "in_progress"].includes(b.status));
  const upcomingTrips = bookings.filter(b => b.pickup_date > today && b.status !== "completed");
  const completedTrips = bookings.filter(b => b.status === "completed");

  const stats = [
    { label: "Today", value: todayTrips.length, icon: CalendarCheck, gradient: "from-blue-500/10 to-blue-600/5" },
    { label: "Active", value: activeTrips.length, icon: Activity, gradient: "from-accent/10 to-accent/5" },
    { label: "Completed", value: completedTrips.length, icon: CheckCircle2, gradient: "from-green-500/10 to-green-600/5" },
  ];

  const TripCard = ({ booking }: { booking: DriverBooking }) => {
    const action = statusFlow.find(s => s.from === booking.status);
    const isUpdating = updatingId === booking.id;
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5 hover:border-border transition-colors space-y-3"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[booking.status] || ""}`}>
            {booking.status.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace(/_/g, " ")}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm font-medium text-foreground break-words">{booking.pickup_location}</span>
          </div>
          {booking.dropoff_location && (
            <div className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-destructive shrink-0" />
              <span className="text-sm font-medium text-foreground break-words">{booking.dropoff_location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.pickup_date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.pickup_time}</span>
          <span>👤 {booking.customer_name}</span>
        </div>

        {booking.vehicles?.name && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Car className="w-3 h-3" /> {booking.vehicles.name}
          </div>
        )}

        {booking.notes && (
          <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3">
            <MessageSquare className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground break-words">{booking.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 flex-1 rounded-xl"
            onClick={() => openInMaps(booking.pickup_location, booking.dropoff_location)}
          >
            <Navigation className="w-3 h-3" /> Maps
          </Button>
          {action && (
            <Button
              size="sm"
              className={`text-xs gap-1.5 flex-1 rounded-xl border-0 ${action.color}`}
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

  const Section = ({ title, trips, dot }: { title: string; trips: DriverBooking[]; dot?: string }) => {
    if (trips.length === 0) return null;
    return (
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
          {title}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {trips.map(b => <TripCard key={b.id} booking={b} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar role="driver" />

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Driver Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your assigned trips</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl bg-gradient-to-br ${stat.gradient} border border-border/50 p-4 sm:p-5`}
              >
                <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-48 rounded-2xl bg-secondary/50 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trips assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <Section title="Today's Trips" trips={todayTrips} dot="bg-accent" />
              <Section title="Upcoming Trips" trips={upcomingTrips} />
              <Section title="Completed" trips={completedTrips} />
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DriverDashboard;
