"use client";

import { Badge } from "@/components/ui/badge";
import { formatExpirationMessage, getExpirationUrgency } from "../utils/expirationHelpers";

interface ExpirationBadgeProps {
  deletedAt: number;
  className?: string;
}

/**
 * ExpirationBadge Component
 *
 * Displays a badge showing how many days remain until an item expires from trash
 * Visual styling changes based on urgency (normal, warning, urgent)
 */
export function ExpirationBadge({ deletedAt, className }: ExpirationBadgeProps) {
  const message = formatExpirationMessage(deletedAt);
  const urgency = getExpirationUrgency(deletedAt);

  // Map urgency to badge variant
  const variantMap = {
    normal: "secondary" as const,
    warning: "default" as const,
    urgent: "destructive" as const,
  };

  const variant = variantMap[urgency];

  // Add pulsing animation for urgent items
  const additionalClasses = urgency === "urgent" ? "animate-pulse" : "";

  return (
    <Badge variant={variant} className={`${additionalClasses} ${className || ""}`}>
      {message}
    </Badge>
  );
}
