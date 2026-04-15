import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

interface NotificationCardProps {
  notification: Tables<"notifications">;
  onMarkAsRead: (id: string) => void;
  index: number;
}

export const NotificationCard = ({ notification, onMarkAsRead, index }: NotificationCardProps) => {
  const date = new Date(notification.created_at);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all",
        notification.is_read
          ? "border-border/50 bg-card"
          : "border-primary/20 bg-notification-unread shadow-sm"
      )}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-notification-dot" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          notification.is_read
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        <Bell className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm leading-relaxed", !notification.is_read && "font-medium")}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>

      {/* Mark as read button */}
      {!notification.is_read && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
          title="Marquer comme lu"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};
