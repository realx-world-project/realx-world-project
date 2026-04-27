"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ReportDialogProps {
  listingId: string;
  listingTitle?: string;
  trigger?: React.ReactNode;
}

export function ReportDialog({ listingId, listingTitle, trigger }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (reason.trim().length < 20) {
      toast({
        title: "Error",
        description: "Please provide a reason with at least 20 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for your report. We'll review it shortly.",
      });

      setReason("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Flag className="mr-2 h-4 w-4" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Listing</DialogTitle>
          <DialogDescription>
            {listingTitle && (
              <span className="text-sm text-muted-foreground">
                Reporting: {listingTitle}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for reporting
            </label>
            <Textarea
              id="reason"
              placeholder="Please describe why you're reporting this listing (minimum 20 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/20 characters minimum
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 20}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}