import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, LogOut, Share } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { navItemsForRole } from "../components/layout/navItems";
import { Card } from "../components/ui/Card";
import { IconGridItem } from "../components/ui/IconTile";
import { BottomSheet } from "../components/ui/BottomSheet";
import { PageHeader } from "../components/ui/PageHeader";
import { useInstall } from "../lib/pwa";

export function MorePage() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  const install = useInstall();
  const [iosHelp, setIosHelp] = useState(false);
  if (!me) return null;

  const items = navItemsForRole(me.role).filter((i) => !i.tab);
  const tools = items.filter((i) => i.group === "tools");
  const admin = items.filter((i) => i.group === "admin");
  const account = items.filter((i) => i.group === "account");

  const grid = (list: typeof items) =>
    list.map((i) => <IconGridItem key={i.to} icon={i.icon} tone={i.tone} label={i.shortLabel} onClick={() => navigate(i.to)} />);

  return (
    <div className="space-y-4">
      <PageHeader title="More" subtitle="Everything else, one tap away" />

      {[...tools, ...admin].length > 0 && (
        <Card>
          <h2 className="font-display mb-1 text-[17px] font-extrabold text-ink-900">Tools</h2>
          <div className="grid grid-cols-4 gap-1">{grid([...tools, ...admin])}</div>
        </Card>
      )}

      <Card>
        <h2 className="font-display mb-1 text-[17px] font-extrabold text-ink-900">You</h2>
        <div className="grid grid-cols-4 gap-1">
          {grid(account)}
          {!install.installed && (install.canPrompt || install.ios) && (
            <IconGridItem
              icon={Download}
              tone="cyan"
              label="Install app"
              onClick={() => (install.canPrompt ? install.prompt() : setIosHelp(true))}
            />
          )}
          <IconGridItem icon={LogOut} tone="red" label="Logout" onClick={logout} />
        </div>
      </Card>

      <BottomSheet open={iosHelp} onClose={() => setIosHelp(false)} title="Install MO Tracker">
        <ol className="space-y-3 text-sm text-ink-700">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Share size={16} />
            </span>
            Tap the <b>Share</b> button in Safari
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">+</span>
            Choose <b>Add to Home Screen</b>
          </li>
        </ol>
      </BottomSheet>
    </div>
  );
}
