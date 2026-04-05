import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Car, Users, CalendarCheck, Clock, CheckCircle, XCircle,
  TrendingUp, Loader2
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

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        .select("id, user_id, vehicle_id, driver_id, service_type, booking_type, pickup_location, dropoff_location, hours, pickup_date, pickup_time, status, price_estimate, notes, created_at, updated_at, vehicles:vehicle_id(name), drivers:driver_id(full_name)")
        .order("created_at", { ascending: false }),
      supabase.from("drivers").select("*").eq("is_active", true),
      supabase.from("profiles").select("id, full_name"),
    ]);
    const profileMap = new Map<string, string>();
    (profilesRes.data as Profile[] || []).forEach(p => { if (p.full_name) profileMap.set(p.id, p.full_name); });
    const enrichedBookings = ((bookingsRes.data as unknown as Booking[]) || []).map(b => ({
      ...b, customer_name: profileMap.get(b.user_id) || "Unknown",
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
    setActionLoading(id);
    await supabase.from("bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setActionLoading(null);
  };

  const assignDriver = async (bookingId: string, driverId: string) => {
    setActionLoading(bookingId);
    await supabase.from("bookings").update({
      driver_id: driverId, status: "driver_assigned", updated_at: new Date().toISOString(),
    }).eq("id", bookingId);
    setActionLoading(null);
  };

  if (authLoading || adminLoading || !isAdmin) return null;

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, gradient: "from-blue-500/10 to-blue-600/5", color: "text-blue-500" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: Clock, gradient: "from-yellow-500/10 to-yellow-600/5", color: "text-yellow-500" },
    { label: "Active Trips", value: bookings.filter(b => ["approved", "driver_assigned", "on_the_way", "arrived", "in_progress"].includes(b.status)).length, icon: TrendingUp, gradient: "from-accent/10 to-accent/5", color: "text-accent" },
    { label: "Completed", value: bookings.filter(b => b.status === "completed").length, icon: CheckCircle, gradient: "from-green-500/10 to-green-600/5", color: "text-green-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time booking management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl bg-gradient-to-br ${stat.gradient} border border-border/50 p-4 sm:p-5`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookings */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Bookings</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-secondary/50 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-card border border-border">
              <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking, i) => {
                const isActioning = actionLoading === booking.id;
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-2xl bg-card border border-border/50 p-4 sm:p-5 hover:border-border transition-colors"
                  >
                    {/* Top row: status + service type */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[booking.status] || ""}`}>
                        {booking.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{booking.service_type.replace(/_/g, " ")}</span>
                      {booking.price_estimate && (
                        <span className="ml-auto text-sm font-bold text-accent">R{booking.price_estimate}</span>
                      )}
                    </div>

                    {/* Route */}
                    <p className="text-sm font-medium text-foreground mb-1 break-words">
                      {booking.pickup_location}
                      {booking.dropoff_location && <span className="text-muted-foreground"> → {booking.dropoff_location}</span>}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mb-3">
                      <span>{booking.pickup_date} at {booking.pickup_time}</span>
                      <span>Customer: {booking.customer_name}</span>
                      {booking.vehicles?.name && <span>Vehicle: {booking.vehicles.name}</span>}
                      {booking.drivers?.full_name && <span>Driver: {booking.drivers.full_name}</span>}
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-muted-foreground italic mb-3 break-words">Note: {booking.notes}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {["pending", "approved"].includes(booking.status) && (
                        <select
                          className="text-xs rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-foreground max-w-[160px]"
                          value={booking.driver_id || ""}
                          onChange={(e) => assignDriver(booking.id, e.target.value)}
                          disabled={isActioning}
                        >
                          <option value="">Assign Driver</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>{d.full_name}</option>
                          ))}
                        </select>
                      )}

                      {booking.status === "pending" && (
                        <>
                          <Button size="sm" className="text-xs gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
                            onClick={() => updateStatus(booking.id, "approved")} disabled={isActioning}>
                            {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => updateStatus(booking.id, "cancelled")} disabled={isActioning}>
                            <XCircle className="w-3 h-3" /> Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === "approved" && !booking.driver_id && (
                        <span className="text-xs text-muted-foreground italic">← Assign a driver</span>
                      )}
                      {booking.status === "in_progress" && (
                        <Button size="sm" className="text-xs gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
                          onClick={() => updateStatus(booking.id, "completed")} disabled={isActioning}>
                          {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Complete
                        </Button>
                      )}
                      {!["cancelled", "completed", "pending"].includes(booking.status) && (
                        <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => updateStatus(booking.id, "cancelled")} disabled={isActioning}>
                          <XCircle className="w-3 h-3" /> Cancel
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
