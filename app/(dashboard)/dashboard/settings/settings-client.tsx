"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle } from "lucide-react";

function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium leading-none">
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          checked
            ? "bg-[#D4AF37] focus-visible:ring-[#D4AF37]"
            : "bg-gray-200 focus-visible:ring-gray-400",
        ].join(" ")}
      >
        <span
          className={[
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}

export default function SettingsClient({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const [notifyApproved, setNotifyApproved] = useState(true);
  const [notifyRejected, setNotifyRejected] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [allowAgents, setAllowAgents] = useState(true);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Manage your account preferences and privacy.
        </p>
      </div>

      {/* Account Settings */}
      <Card className="border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>
            <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {email}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Role
            </p>
            <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {role}
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AF37] hover:text-[#B8961E] transition-colors"
            >
              Update name &amp; phone
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Toggle
            id="notify-approved"
            checked={notifyApproved}
            onChange={setNotifyApproved}
            label="Email me when my listing is approved"
          />
          <Divider />
          <Toggle
            id="notify-rejected"
            checked={notifyRejected}
            onChange={setNotifyRejected}
            label="Email me when my listing is rejected"
          />
          <Divider />
          <Toggle
            id="notify-messages"
            checked={notifyMessages}
            onChange={setNotifyMessages}
            label="Email me about new messages"
          />
          <p className="mt-4 rounded-md border border-dashed border-[#D4AF37]/40 bg-[#D4AF37]/5 px-3 py-2 text-xs text-muted-foreground">
            Notification preferences will be fully configurable in the next update.
          </p>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Toggle
            id="show-phone"
            checked={showPhone}
            onChange={setShowPhone}
            label="Show my phone number on listings"
            description="Your phone number will be visible to interested buyers."
          />
          <Divider />
          <Toggle
            id="allow-agents"
            checked={allowAgents}
            onChange={setAllowAgents}
            label="Allow agents to contact me"
            description="Licensed agents may reach out about your listings."
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            This action cannot be undone. Contact{" "}
            <a
              href="mailto:support@realxworld.net"
              className="font-medium underline underline-offset-2"
            >
              support@realxworld.net
            </a>{" "}
            to delete your account.
          </p>
          <div
            title="To delete your account, please contact support@realxworld.net"
            className="inline-block"
          >
            <Button
              variant="destructive"
              disabled
              className="cursor-not-allowed opacity-60"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
