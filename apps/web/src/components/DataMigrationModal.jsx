import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Database, AlertCircle, CheckCircle2, ArrowRightLeft, RefreshCw, Calendar, FileText, UploadCloud, Layers } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';

export default function DataMigrationModal({ isOpen, onOpenChange }) {
  const [status, setStatus] = useState('idle'); // idle, syncing, success, error
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setStatus('syncing');
    setError(null);
    setProgress(null);
    setResult(null);
    
    try {
      const response = await apiServerClient.fetch('/migrate/sync-test-to-live', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pb.authStore.token}`
        }
      });
      
      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch (e) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        
        console.error('Migration API Error Response:', errData);
        
        let extractedError = errData.error || errData.message || errData;
        if (typeof extractedError === 'object') {
          extractedError = JSON.stringify(extractedError, null, 2);
        }
        
        throw new Error(extractedError);
      }

      // Handle both chunked (streaming NDJSON) and standard single JSON responses
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Normalize buffer in case multiple JSON objects were sent without newlines
        const normalizedBuffer = buffer.replace(/\}\s*\{/g, '}\n{');
        const lines = normalizedBuffer.split('\n');
        
        // Keep the last part which might be an incomplete JSON string
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.status === 'in_progress') {
              setProgress({
                currentCollection: data.currentCollection,
                processed: data.processed,
                total: data.total
              });
            } else if (data.status === 'completed' || data.summary) {
              finalData = data;
            }
          } catch (err) {
            // Ignore parse errors on incomplete chunks
          }
        }
      }

      // Process any remaining data in the buffer after stream ends
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.status === 'in_progress') {
            setProgress({
              currentCollection: data.currentCollection,
              processed: data.processed,
              total: data.total
            });
          } else if (data.status === 'completed' || data.summary) {
            finalData = data;
          }
        } catch (err) {
          console.warn('Final buffer parse error:', err);
        }
      }

      if (finalData && (finalData.status === 'completed' || finalData.summary)) {
        setResult(finalData);
        setStatus('success');
      } else {
        throw new Error('Received unexpected response format or migration did not complete properly.');
      }
      
    } catch (err) {
      console.error('Full migration error object:', err);
      
      let displayError = 'An unexpected error occurred during migration.';
      
      if (err instanceof Error) {
        displayError = err.message;
      } else if (typeof err === 'string') {
        displayError = err;
      } else if (typeof err === 'object' && err !== null) {
        displayError = err.error || err.message || JSON.stringify(err, null, 2);
      }
      
      // Final safety check to ensure we don't render [object Object]
      if (typeof displayError === 'object') {
        try {
          displayError = JSON.stringify(displayError, null, 2);
        } catch (e) {
          displayError = String(displayError);
        }
      }
      
      setError(displayError);
      setStatus('error');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation completes
    setTimeout(() => {
      if (status !== 'syncing') {
        setStatus('idle');
        setProgress(null);
        setResult(null);
        setError(null);
      }
    }, 300);
  };

  const calculatePercentage = () => {
    if (!progress || !progress.total || progress.total === 'calculating') return undefined;
    const pct = (progress.processed / progress.total) * 100;
    return isNaN(pct) ? undefined : Math.min(100, Math.max(0, pct));
  };

  return (
    <Dialog open={isOpen} onOpenChange={status === 'syncing' ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[650px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Data Migration</DialogTitle>
          <DialogDescription>
            Synchronize database records and files from the testing environment to production.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary">
                <Database className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold tracking-tight">Ready to synchronize</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This process will fetch all records and files from the test instance and safely upsert them into the live instance. Existing records will be updated seamlessly.
                </p>
              </div>
              <Button onClick={handleSync} size="lg" className="w-full sm:w-auto shadow-md">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Start Sync Process
              </Button>
            </div>
          )}

          {status === 'syncing' && (
            <div className="space-y-8 py-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-medium text-foreground">Syncing in progress...</h3>
                  <p className="text-sm text-muted-foreground">
                    Please keep this window open while we transfer your data.
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl border border-border p-5 space-y-4 max-w-md mx-auto w-full shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    {progress?.currentCollection || 'Initializing...'}
                  </span>
                  <span className="font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/50">
                    {progress?.processed || 0} / {progress?.total && progress.total !== 'calculating' ? progress.total : '?'}
                  </span>
                </div>
                
                <Progress 
                  value={calculatePercentage()} 
                  className="h-2.5 bg-background shadow-inner" 
                />
              </div>
            </div>
          )}

          {status === 'error' && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive mb-4">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-base font-semibold">Migration Failed</AlertTitle>
              <AlertDescription className="mt-3 flex flex-col items-start gap-4">
                <div className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap break-words w-full max-h-40 overflow-y-auto bg-destructive/5 p-3 rounded border border-destructive/10 font-mono">
                  {error}
                </div>
                <Button variant="outline" onClick={handleSync} size="sm" className="bg-background hover:bg-background/90 text-foreground">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Sync
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && result && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-3 pb-2">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-500 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">Sync Complete</h3>
                {result.timestamp && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Completed on {new Date(result.timestamp).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/40 shadow-none border-border/50">
                  <CardContent className="p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Total Records</span>
                    </div>
                    <span className="text-3xl font-semibold tabular-nums tracking-tight">
                      {result.totalRecords || 0}
                    </span>
                  </CardContent>
                </Card>
                <Card className="bg-muted/40 shadow-none border-border/50">
                  <CardContent className="p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Layers className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Collections</span>
                    </div>
                    <span className="text-3xl font-semibold tabular-nums tracking-tight">
                      {result.totalCollections || 0}
                    </span>
                  </CardContent>
                </Card>
              </div>
              
              {result.summary && (
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <h4 className="text-sm font-semibold mb-4 text-foreground flex items-center">
                    Detailed Summary
                  </h4>
                  <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <dt className="text-muted-foreground">Records Created</dt>
                      <dd className="font-mono font-medium">{result.summary.recordsCreated || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <dt className="text-muted-foreground">Records Updated</dt>
                      <dd className="font-mono font-medium">{result.summary.recordsUpdated || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <dt className="text-muted-foreground flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5" /> Files Transfered
                      </dt>
                      <dd className="font-mono font-medium">{result.summary.filesTransferred || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <dt className="text-muted-foreground">Failed Records</dt>
                      <dd className={`font-mono font-medium ${result.summary.recordsFailed > 0 ? 'text-destructive' : ''}`}>
                        {result.summary.recordsFailed || 0}
                      </dd>
                    </div>
                  </dl>
                  
                  {result.summary.errors && result.summary.errors.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-border">
                      <h4 className="text-xs font-semibold text-destructive mb-2 flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                        Warnings ({result.summary.errors.length})
                      </h4>
                      <ul className="text-xs text-destructive/80 space-y-1.5 max-h-32 overflow-y-auto bg-destructive/5 p-3 rounded-md border border-destructive/10">
                        {result.summary.errors.map((err, i) => (
                          <li key={i} className="leading-relaxed break-words">{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/40 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={status === 'syncing'}>
            {status === 'success' ? 'Done' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}