import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Car, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Booking {
  id: string;
  booking_type: string;
  service_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  hours: number | null;
  pickup_date: string;
  pickup_time: string;
  vehicle_id: string | null;
  driver_id: string | null;
  status: string;
  price_estimate: number | null;
  is_favourite: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { name: string } | null;
  drivers?: { full_name: string } | null;
}

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

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  driver_assigned: "Driver Assigned",
  on_the_way: "Driver On The Way",
  arrived: "Driver Arrived",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, user_id, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, status, price_estimate, is_favourite, notes, created_at, updated_at, vehicles:vehicle_id(name), drivers:driver_id(full_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings((data as unknown as Booking[]) || []);
      setLoading(false);
    };

    fetchBookings();

    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` },
        () => { fetchBookings(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 section-padding">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
                <p className="text-muted-foreground mt-1">{user.email}</p>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => navigate("/book")}>
                <Car className="w-4 h-4" /> New Booking
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Bookings", value: bookings.length },
                { label: "Active", value: bookings.filter(b => ["pending", "approved", "driver_assigned", "on_the_way", "arrived", "in_progress"].includes(b.status)).length },
                { label: "Completed", value: bookings.filter(b => b.status === "completed").length },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-card border border-border p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-4">Your Bookings</h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-card border border-border">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bookings yet.</p>
                <Button variant="accent" className="mt-4" onClick={() => navigate("/book")}>Book Your First Ride</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <motion.div key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent shrink-0" />
                          <span className="font-medium text-foreground truncate">{booking.pickup_location}</span>
                          {booking.dropoff_location && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium text-foreground truncate">{booking.dropoff_location}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.pickup_date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.pickup_time}</span>
                          {booking.hours && <span>{booking.hours}hrs</span>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {booking.vehicles?.name && (
                            <span className="flex items-center gap-1">
                              <Car className="w-3 h-3" /> {booking.vehicles.name}
                            </span>
                          )}
                          {booking.drivers?.full_name && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> Driver: {booking.drivers.full_name}
                            </span>
                          )}
                          <span className="capitalize">{booking.service_type.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1 shrink-0 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || ""}`}>
                          {statusLabels[booking.status] || booking.status.replace(/_/g, " ")}
                        </span>
                        {booking.price_estimate && (
                          <p className="text-sm font-semibold text-accent">R{booking.price_estimate}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
