import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Backend Required", description: "Enable Lovable Cloud to activate authentication." });
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
                <Input placeholder="John Doe" className="h-12 mt-1.5" />
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input type="email" placeholder="you@example.com" className="h-12 mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <Input type="password" placeholder="••••••••" className="h-12 mt-1.5" />
            </div>
            <Button variant="accent" size="lg" className="w-full" type="submit">
              {isLogin ? "Sign In" : "Sign Up"}
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
