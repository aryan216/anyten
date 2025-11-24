"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

  const copyToClipboard = async () => {
    try {
      navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy webhook URL");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe trigger configuration</DialogTitle>
          <DialogDescription>
            Configure this webhool URL in your Stripe dashboard to trigger this workflow on the payment events{" "}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium">Webhook URL</label>
            <div className="flex gap-2 w-full">
              <input
                id="webhook-url"
                readOnly
                value={webhookUrl}
                className="font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                type="button"
                variant="outline"
                size="icon"
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4>Setup Instructions:</h4>
            <ol className="text-sm list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Open your Stripe Dashboard </li>
                <li>Go to Developers → Webhooks.</li>
                <li>click "Add endpoint"</li>
                <li>Paste the webhook URL above</li>
                <li>Select events to listen for (e.g., payment_intent.succeeded)</li>
                <li>Save and copy the signing secret</li>
            </ol>
          </div>
          
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className=" text-sm text-muted-foreground space-y-1">
              <li><code className="font-medium">{"{{stripe.amount}}"}</code>- Payment amount</li>
              <li><code className="font-medium">{"{{stripe.currency}}"}</code>- Currency</li>
              <li><code className="font-medium">{"{{json stripe}}"}</code>- Full event data as json</li>
              <li><code className="font-medium">{"{{stripe.eventType}}"}</code>- Event Type (e.g., payment_intent.succeeded)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
