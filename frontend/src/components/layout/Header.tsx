import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Heart, User, LogOut, Settings, Mail } from "lucide-react";
import { supabase, isMockMode } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isMockMode) {
      // Mock login for demo
      setIsLoggedIn(true);
      setUser({ email: "demo@example.com", id: "demo-user" });
      toast({
        title: "Logged in (Demo Mode)",
        description: "Connect Supabase for real authentication",
      });
      return;
    }

    // In a real app, this would show a login modal
    toast({
      title: "Login",
      description: "Login functionality requires Supabase setup",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    toast({
      title: "Signed out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">CarePredict AI</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About Us
          </a>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/avatars/doctor.png"
                      alt={user?.email || "User"}
                    />
                    <AvatarFallback>
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-popover"
                align="end"
                forceMount
              >
                <DropdownMenuItem className="hover:bg-muted">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-muted"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              {/* <Button variant="ghost" onClick={handleLogin}>
                Login
              </Button> */}
              <Button onClick={handleLogin}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
