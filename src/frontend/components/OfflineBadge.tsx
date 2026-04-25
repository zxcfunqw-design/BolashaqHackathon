import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "./ui/Badge";

type OfflineBadgeProps = {
  online: boolean;
};

export function OfflineBadge({ online }: OfflineBadgeProps) {
  return (
    <Badge tone={online ? "green" : "yellow"} className="shrink-0">
      {online ? <Wifi size={14} /> : <WifiOff size={14} />}
      {online ? "Online" : "Offline: твой путь сохранён"}
    </Badge>
  );
}
