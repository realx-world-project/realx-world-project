"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const { toast } = useToast();
  const [listingFee, setListingFee] = useState(initialSettings.LISTING_FEE ?? "5000");
  const [enquiryFee, setEnquiryFee] = useState(initialSettings.ENQUIRY_FEE ?? "500");
  const [commissionRate, setCommissionRate] = useState(initialSettings.COMMISSION_RATE ?? "3");
  const [paymentsEnabled, setPaymentsEnabled] = useState(initialSettings.PAYMENTS_ENABLED === "true");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const saveSetting = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Setting saved", description: `${key.replace(/_/g, " ")} updated.` });
    } catch {
      toast({ title: "Error", description: "Could not save setting.", variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const saveAll = async () => {
    await Promise.all([
      saveSetting("LISTING_FEE", listingFee),
      saveSetting("ENQUIRY_FEE", enquiryFee),
      saveSetting("COMMISSION_RATE", commissionRate),
    ]);
  };

  const togglePayments = async (checked: boolean) => {
    setPaymentsEnabled(checked);
    await saveSetting("PAYMENTS_ENABLED", checked ? "true" : "false");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Payment Settings</CardTitle>
          {paymentsEnabled ? (
            <Badge variant="success">Payments Active</Badge>
          ) : (
            <Badge variant="warning">Payments Disabled — Free Mode</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="payments-enabled" className="text-sm font-medium">
              Payments Enabled
            </Label>
            <p className="text-sm text-muted-foreground">
              When off, listing fees, enquiry fees, and escrow are free for everyone.
            </p>
          </div>
          <Switch
            id="payments-enabled"
            checked={paymentsEnabled}
            onCheckedChange={togglePayments}
            disabled={savingKey === "PAYMENTS_ENABLED"}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="listing-fee">Listing Fee (₦)</Label>
            <Input
              id="listing-fee"
              type="number"
              min={0}
              value={listingFee}
              onChange={(e) => setListingFee(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquiry-fee">Enquiry Fee (₦)</Label>
            <Input
              id="enquiry-fee"
              type="number"
              min={0}
              value={enquiryFee}
              onChange={(e) => setEnquiryFee(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission-rate">Commission Rate (%)</Label>
            <Input
              id="commission-rate"
              type="number"
              min={0}
              max={100}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={saveAll}
            disabled={savingKey !== null}
            className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
          >
            {savingKey && savingKey !== "PAYMENTS_ENABLED" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save All Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
