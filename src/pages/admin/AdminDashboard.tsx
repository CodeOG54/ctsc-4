import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Car, Users, CalendarCheck, Clock, CheckCircle, XCircle,
  TrendingUp, UserPlus, Truck, LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import AdminLayout from "./AdminLayout";

interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  service_type: string;
  booking_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  hours: number | null;
  pickup_date: string;
  pickup_time: string;
  status: string;
  price_estimate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { name: string } | null;
  drivers?: { full_name: string } | null;
  // Client-side joined
  customer_name?: string;
}

interface Driver {
  id: string;
  full_name: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  full_name: string | null;
}

interface Driver {
  id: string;
  full_name: string;
  is_active: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-accent/10 text-accent border-accent/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) navigate("/auth");
      else if (!isAdmin) navigate("/dashboard");
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const fetchData = async () => {
    const [bookingsRes, driversRes, profilesRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, vehicles:vehicle_id(name), drivers:driver_id(full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("drivers").select("*").eq("is_active", true),
      supabase.from("profiles").select("id, full_name"),
    ]);

    const profileMap = new Map<string, string>();
    (profilesRes.data as Profile[] || []).forEach(p => {
      if (p.full_name) profileMap.set(p.id, p.full_name);
    });

    const enrichedBookings = ((bookingsRes.data as Booking[]) || []).map(b => ({
      ...b,
      customer_name: profileMap.get(b.user_id) || "Unknown",
    }));

    setBookings(enrichedBookings);
    setDrivers((driversRes.data as Driver[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();

    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  };

  const assignDriver = async (bookingId: string, driverId: string) => {
    await supabase.from("bookings").update({ driver_id: driverId, updated_at: new Date().toISOString() }).eq("id", bookingId);
  };

  if (authLoading || adminLoading || !isAdmin) return null;

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "text-blue-500" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: Clock, color: "text-yellow-500" },
    { label: "Active Trips", value: bookings.filter(b => ["confirmed", "in_progress"].includes(b.status)).length, icon: TrendingUp, color: "text-accent" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time booking management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-card border border-border p-5">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground mt-3">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookings Table */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">All Bookings</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <motion.div key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl bg-card border border-border p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left info */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[booking.status] || ""}`}>
                          {booking.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace("_", " ")}</span>
                      </div>
                      <p className="font-medium text-foreground truncate">
                        {booking.pickup_location}
                        {booking.dropoff_location && <span className="text-muted-foreground"> → {booking.dropoff_location}</span>}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{booking.pickup_date} at {booking.pickup_time}</span>
                        <span>Customer: {booking.customer_name || "Unknown"}</span>
                        {booking.vehicles?.name && <span>Vehicle: {booking.vehicles.name}</span>}
                        {booking.drivers?.full_name && <span>Driver: {booking.drivers.full_name}</span>}
                        {booking.price_estimate && <span className="font-semibold text-accent">R{booking.price_estimate}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {/* Driver assignment */}
                      <select
                        className="text-xs rounded-lg border border-border bg-card px-2 py-1.5 text-foreground"
                        value={booking.driver_id || ""}
                        onChange={(e) => assignDriver(booking.id, e.target.value)}
                      >
                        <option value="">Assign Driver</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                      </select>

                      {/* Status buttons */}
                      {booking.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="text-xs gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10"
                            onClick={() => updateStatus(booking.id, "confirmed")}>
                            <CheckCircle className="w-3 h-3" /> Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => updateStatus(booking.id, "cancelled")}>
                            <XCircle className="w-3 h-3" /> Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="text-xs gap-1 text-accent border-accent/30 hover:bg-accent/10"
                          onClick={() => updateStatus(booking.id, "in_progress")}>
                          <Car className="w-3 h-3" /> Start Trip
                        </Button>
                      )}
                      {booking.status === "in_progress" && (
                        <Button size="sm" variant="outline" className="text-xs gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10"
                          onClick={() => updateStatus(booking.id, "completed")}>
                          <CheckCircle className="w-3 h-3" /> Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;