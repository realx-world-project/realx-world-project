"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { format } from "date-fns";
import { Clock, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type Role = "BUYER" | "SELLER" | "ADMIN";
type UpgradeStatus = "PENDING" | "APPROVED" | "REJECTED";

interface UpgradeRequest {
  status: UpgradeStatus;
  reason: string;
  adminNote: string | null;
  createdAt: string;
}

interface SettingsClientProps {
  email: string;
  role: Role;
  isActive: boolean;
  upgradeRequest: UpgradeRequest | null;
}

const MIN_REASON_LENGTH = 50;

export default function SettingsClient({ email, role, isActive, upgradeRequest: initialUpgradeRequest }: SettingsClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequest | null>(initialUpgradeRequest);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const submitUpgradeRequest = async () => {
    if (reason.trim().length < MIN_REASON_LENGTH) {
      setSubmitError(`Please provide at least ${MIN_REASON_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/user/upgrade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setUpgradeRequest({
        status: "PENDING",
        reason,
        adminNote: null,
        createdAt: new Date().toISOString(),
      });
      setReason("");
      toast({ title: "Request submitted", description: "We'll review your request and notify you by email." });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch("/api/user/delete-account", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete account");
      }

      await signOut({ callbackUrl: "/home" });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  const showUpgradeForm = !upgradeRequest || upgradeRequest.status === "REJECTED";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and role</p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <div>
              <p className="text-sm font-medium">Email Address</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                To change your email address, contact support.
              </p>
            </div>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm font-medium">Password</span>
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm">Change Password</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm font-medium">Account Status</span>
            <Badge variant={isActive ? "success" : "destructive"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Role & Access */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm font-medium">Current Role</span>
            <Badge>{role}</Badge>
          </div>

          {role === "BUYER" && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <h3 className="text-base font-semibold">Become a Seller</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  As a Seller on RealX World you can list properties for sale or rent, manage
                  your listings, and connect with buyers across Nigeria.
                </p>
              </div>

              {upgradeRequest?.status === "PENDING" && (
                <Card className="border-l-4 border-amber-400">
                  <CardContent className="flex gap-3 p-4">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="font-medium">Request Under Review</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your request to become a Seller is currently being reviewed by our
                        team. We will notify you by email once a decision has been made.
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Submitted: {format(new Date(upgradeRequest.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {upgradeRequest?.status === "REJECTED" && (
                <Card className="border-l-4 border-red-500">
                  <CardContent className="flex gap-3 p-4">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium">Request Not Approved</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Your previous request was not approved.
                      </p>
                      {upgradeRequest.adminNote && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <strong>Reason:</strong> {upgradeRequest.adminNote}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {showUpgradeForm && (
                <div className="space-y-3">
                  {submitError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Why do you want to become a Seller?</label>
                    <Textarea
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Tell us about your real estate background and what you plan to list on RealX World. Minimum 50 characters."
                    />
                    <p className="text-xs text-muted-foreground">
                      {reason.length} / {MIN_REASON_LENGTH} characters minimum
                    </p>
                  </div>
                  <Button
                    onClick={submitUpgradeRequest}
                    disabled={isSubmitting}
                    className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Request Seller Access
                  </Button>
                </div>
              )}
            </div>
          )}

          {role === "SELLER" && (
            <Card className="border-l-4 border-green-500">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <p className="text-sm text-muted-foreground">
                    You are a Seller on RealX World. You can list properties and manage your
                    listings from your dashboard.
                  </p>
                </div>
                <Link href="/dashboard/listings" className="shrink-0">
                  <Button variant="outline" size="sm">View My Listings</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {role === "ADMIN" && (
            <p className="text-sm text-muted-foreground">
              You have full admin access to the platform.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot
                be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, listings, and all associated data.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteAccount} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
