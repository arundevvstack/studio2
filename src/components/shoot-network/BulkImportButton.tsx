
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { importShootNetworkFromSheet } from "@/app/actions/import-talent";
import { toast } from "@/hooks/use-toast";

export function BulkImportButton() {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await importShootNetworkFromSheet();
      if (result.success) {
        toast({
          title: "Synchronization Successful",
          description: result.message
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import Failure",
        description: error.message
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleImport} 
      disabled={isImporting}
      variant="outline" 
      className="h-12 px-6 rounded-xl font-bold bg-white border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 tracking-normal shadow-sm"
    >
      {isImporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      {isImporting ? "Syncing Sheet..." : "Bulk Import"}
    </Button>
  );
}
