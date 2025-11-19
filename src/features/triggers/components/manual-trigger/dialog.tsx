"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
 } from "@/components/ui/dialog"

 interface Props {
    open :boolean;
    onOpenChange:(open:boolean)=>void;
 }

 export const ManualTriggerDialog = ({open,onOpenChange}:Props) => {
     return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manual Trigger</DialogTitle>
                    <DialogTitle>Configure setting for manual trigger node.</DialogTitle>
                </DialogHeader>
                <DialogDescription className="py-4">
                    <p className="text-sm text-muted-foreground">Used to manually Execute a workflow no configurations avaiable</p>
                </DialogDescription>
             
            </DialogContent>
        </Dialog>
     )
 }