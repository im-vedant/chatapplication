import React, { useRef, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Paperclip, Send, X, Image, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import uuidv4 from "../utils/uuid";
import { useFetchUploadUrl } from "../hooks/useUtils";

export interface UploadedFileInfo {
  url: string;
  key: string;
  name: string;
  type: string;
  uploading: boolean;
  error?: string;
}

interface ChatInputBoxProps {
  input: string;
  setInput: (v: string) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  filePreviews: (string | null)[];
  setFilePreviews: (f: (string | null)[]) => void;
  uploadedFileInfos: UploadedFileInfo[];
  setUploadedFileInfos: (f: UploadedFileInfo[]) => void;
  loading: boolean;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  onSend: () => void;
  disabled?: boolean;
}

const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  input,
  setInput,
  files,
  setFiles,
  filePreviews,
  setFilePreviews,
  uploadedFileInfos,
  setUploadedFileInfos,
  loading,
  uploading,
  setUploading,
  onSend,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchUploadUrlMutation = useFetchUploadUrl();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Auto-resize textarea - use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`; // Max height of 128px
    });
  }, [setInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    const newInfos = uploadedFileInfos.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFilePreviews(newPreviews);
    setUploadedFileInfos(newInfos);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [files, filePreviews, uploadedFileInfos, setFiles, setFilePreviews, setUploadedFileInfos]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    // Preview
    const previews = await Promise.all(selectedFiles.map(f => {
      if (f.type.startsWith('image/')) {
        return new Promise<string | null>(resolve => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target?.result as string);
          reader.readAsDataURL(f);
        });
      } else {
        return Promise.resolve(null);
      }
    }));
    
    setFiles([...files, ...selectedFiles]);
    setFilePreviews([...filePreviews, ...previews]);
    
    // Upload all
    const uploadInfos = await Promise.all(selectedFiles.map(async (f) => {
      const uuid = uuidv4();
      try {
        // Use the hook to get upload URL
        const { uploadUrl } = await fetchUploadUrlMutation.mutateAsync({
          filename: uuid,
          contentType: f.type
        });
        
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': f.type },
          body: f
        });
        
        if (!uploadRes.ok) throw new Error('Upload failed');
        return { url: uploadUrl, key: uuid, name: f.name, type: f.type, uploading: false };
      } catch (err) {
        return { url: '', key: uuid, name: f.name, type: f.type, uploading: false, error: (err instanceof Error ? err.message : 'Unknown error') };
      }
    }));
    
    setUploadedFileInfos([...uploadedFileInfos, ...uploadInfos]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [files, filePreviews, uploadedFileInfos]);

  const canSend = (input.trim() !== "" || uploadedFileInfos.filter(f => !f.error && !f.uploading).length > 0) && !loading && !uploading && !disabled;

  return (
    <TooltipProvider>
      <div className="w-full space-y-3">
        {/* File attachments */}
        {uploadedFileInfos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploadedFileInfos.map((info, idx) => (
              <Badge
                key={info.key}
                variant={info.error ? "destructive" : "secondary"}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 max-w-[200px]",
                  info.uploading && "opacity-60"
                )}
              >
                {filePreviews[idx] ? (
                  <Image className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-xs truncate">{info.name}</span>
                {info.uploading && (
                  <span className="text-xs text-muted-foreground">...</span>
                )}
                {!info.uploading && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFile(idx)}
                    disabled={uploading || loading || disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileChange}
            disabled={loading || uploading || disabled}
            className="hidden"
          />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploading || disabled}
                className="flex-shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Attach files (images, PDFs)</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              disabled={loading || uploading || disabled}
              className="min-h-[44px] max-h-32 resize-none pr-12"
              rows={1}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  onClick={onSend}
                  disabled={!canSend}
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message (Enter)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* {loading && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary mr-2"></div>
            Sending message...
          </div>
        )} */}

        {uploading && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary mr-2"></div>
            Uploading files...
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default React.memo(ChatInputBox);
