import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useDriverCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setDriverId(null);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("id")
        .eq("email", user.email)
        .eq("is_active", true)
        .maybeSingle();
      setDriverId(data?.id || null);
      setLoading(false);
    };
    check();
  }, [user, authLoading]);

  return { isDriver: !!driverId, driverId, loading: loading || authLoading };
};
