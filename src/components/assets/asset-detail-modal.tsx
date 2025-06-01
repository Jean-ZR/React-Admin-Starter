
'use client';

import React from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AssetFormData } from './asset-form-modal'; // Assuming AssetFormData includes all necessary fields
import { format } from 'date-fns';

interface AssetForDetail extends AssetFormData {
  id: string;
  purchaseDate?: any; // Allow flexible types as they come from Firestore
  warrantyEnd?: any;
  cost?: string | number | null;
}

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetData: AssetForDetail | null;
}

export function AssetDetailModal({ isOpen, onClose, assetData }: AssetDetailModalProps) {
  if (!assetData) {
    return null;
  }

  const formatDate = (dateInput: any): string => {
    if (!dateInput) return 'N/A';
    try {
      const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
      return format(date, 'PPP'); // Example: Jan 15, 2023
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCost = (costInput: any): string => {
    if (costInput === null || costInput === undefined || String(costInput).trim() === '') return 'N/A';
    const costNumber = Number(costInput);
    if (isNaN(costNumber)) return 'Invalid Cost';
    return `$${costNumber.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card text-card-foreground">
        <DialogHeader className="border-b border-border pb-4 mb-4">
          <DialogTitle className="text-2xl font-semibold">{assetData.name}</DialogTitle>
          <DialogDescription>Asset ID: <span className="font-mono text-xs text-muted-foreground">{assetData.id}</span></DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <Image
                src={assetData.image || `https://placehold.co/600x400.png`}
                alt={assetData.name || "Asset image"}
                width={600}
                height={400}
                className="rounded-lg object-cover aspect-square border border-border"
                data-ai-hint={assetData.dataAiHint || 'asset item'}
                onError={(e) => e.currentTarget.src = `https://placehold.co/600x400.png`}
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                <Badge 
                  variant={assetData.status === 'Active' ? 'default' : assetData.status === 'In Repair' ? 'secondary' : 'outline'}
                  className={
                    assetData.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    assetData.status === 'In Repair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    assetData.status === 'Maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'text-muted-foreground'
                  }
                >
                  {assetData.status}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                <p className="text-foreground">{assetData.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Serial Number</h4>
                <p className="text-foreground font-mono text-sm">{assetData.serialNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
              <p className="text-foreground">{assetData.location || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Assigned To</h4>
              <p className="text-foreground">{assetData.assignedTo || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Cost</h4>
              <p className="text-foreground">{formatCost(assetData.cost)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Purchase Date</h4>
              <p className="text-foreground">{formatDate(assetData.purchaseDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Warranty End Date</h4>
              <p className="text-foreground">{formatDate(assetData.warrantyEnd)}</p>
            </div>
          </div>
          
          {assetData.description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-foreground text-sm whitespace-pre-wrap">{assetData.description}</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-6 pt-4 border-t border-border">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
