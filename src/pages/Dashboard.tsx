import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCard } from "@/components/NotificationCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bell, CheckCheck, LogOut, RefreshCw, Loader2, Wrench, Inbox } from "lucide-react";

const Dashboard = () => {
  const { technicien, signOut } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch } =
    useNotifications();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold leading-none">SIYENA</h1>
              <p className="text-xs text-muted-foreground">
                Bonjour, {technicien?.nom ?? "Technicien"}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-foreground" />
            <h2 className="font-heading text-xl font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tout lire</span>
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-muted-foreground"
          >
            <Inbox className="mb-3 h-12 w-12 opacity-40" />
            <p className="text-sm">Aucune notification pour le moment</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkAsRead={markAsRead}
                index={i}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
