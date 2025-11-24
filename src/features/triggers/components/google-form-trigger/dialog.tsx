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
import { generateGoogleFormScript } from "./utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

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
          <DialogTitle>Google Form configuration</DialogTitle>
          <DialogDescription>
            Use this webhook url in your Google form's app script to trigger
            this workflow when a form is submitted{" "}
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
                <li>Open your Google Form </li>
                <li>click on the three dots menu → select "Script editor".</li>
                <li>copy and paste the script below</li>
                <li>replace the WEBHOOK_URL with your webhook url above</li>
                <li>Save and click "Triggers" → Add Trigger</li>
                <li>Choose:From form → On form submit → save</li>
            </ol>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h4 className="font-medium text-sm">Google Apps Script</h4>
            <Button
              type="button"
              variant="outline"
              onClick={async() => {
                const script=generateGoogleFormScript(webhookUrl);
                try {
                  await navigator.clipboard.writeText(script);
                  toast.success("Google Apps Script copied to clipboard");
                } catch (error) {
                  toast.error("Failed to copy script");
                }
              }}
            >
              <CopyIcon className="size-4 mr-2" />
              Copy Google Apps Script
            </Button>
            <p className="text-xs text-muted-forground">This script handles your webhook URl that handles form submissions</p>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className=" text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{googleForm.respondantEmail}}"}
                </code>
                - Respondant's email address
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{googleForm.responses['Question Name']}}"}
                </code>
                - Specific answer
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{json googleForm.responses}}"}
                </code>
                - All responses as JSON object
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
