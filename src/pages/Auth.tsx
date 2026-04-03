import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const checkRoleAndRedirect = async () => {
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminRole) {
          navigate("/admin");
          return;
        }

        const { data: driverId, error: driverError } = await supabase.rpc("get_current_driver_id");

        if (driverError) {
          console.error("Driver redirect check failed", driverError);
        }

        navigate(driverId ? "/driver" : "/dashboard");
      };

      checkRoleAndRedirect();
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Welcome back! 👋" });
      // Redirect handled by useEffect when user state updates
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account Created! 🎉", description: "Check your email to confirm your account." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 section-padding flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <Input placeholder="John Doe" className="h-12 mt-1.5" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input type="email" placeholder="you@example.com" className="h-12 mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <Input type="password" placeholder="••••••••" className="h-12 mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button variant="accent" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-accent font-medium hover:underline">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;