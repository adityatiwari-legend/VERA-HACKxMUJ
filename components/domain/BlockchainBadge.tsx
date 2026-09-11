import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Boxes, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { HashDisplay } from "@/components/financial/HashDisplay";

/**
 * BlockchainBadge (Upgraded) — component.md §3.6
 * Unifies on-chain proof display across milestones, donations, and contracts.
 */

export interface BlockchainBadgeProps {
  network?: "Hardhat" | "Sepolia" | "Mainnet";
  txHash?: string;
  explorerUrl?: string;
  blockConfirmations?: number;
  confirmed?: boolean;
  variant?: "compact" | "full";
  className?: string;
}

export function BlockchainBadge({
  network = "Sepolia",
  txHash,
  explorerUrl,
  blockConfirmations,
  confirmed = true,
  variant = "full",
  className,
}: BlockchainBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-white/[0.03]",
        confirmed
          ? "border-cyber-cyan-500/25"
          : "border-alert-amber-500/25",
        className
      )}
    >
      <span
        className={cn(
          "shrink-0 w-6 h-6 rounded-md flex items-center justify-center",
          confirmed
            ? "bg-cyber-cyan-500/10 text-cyber-cyan-500"
            : "bg-alert-amber-500/10 text-alert-amber-500"
        )}
      >
        {confirmed ? <ShieldCheck className="w-3.5 h-3.5" /> : <Boxes className="w-3.5 h-3.5" />}
      </span>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <Badge variant={confirmed ? "cyan" : "amber"} size="xs" label={network} />
          {typeof blockConfirmations === "number" && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500">
              <Link2 className="w-3 h-3" />
              {blockConfirmations} conf
            </span>
          )}
        </div>
        {txHash && variant === "full" && (
          <div className="mt-0.5">
            <HashDisplay hash={txHash} type="tx" explorerUrl={explorerUrl} />
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockchainBadge;
