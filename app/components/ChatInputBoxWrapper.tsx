import React, { useState } from "react";
import ChatInputBox, { UploadedFileInfo } from "./ChatInputBox";

interface ChatInputBoxWrapperProps {
  onSend: (input: string, fileKeys: string[]) => void;
  loading: boolean;
}

const ChatInputBoxWrapper: React.FC<ChatInputBoxWrapperProps> = ({ onSend, loading }) => {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<(string | null)[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileInfos, setUploadedFileInfos] = useState<UploadedFileInfo[]>([]);

  const handleSend = () => {
    if (input.trim() === "" && uploadedFileInfos.filter(f => !f.error && !f.uploading).length === 0) return;
    const fileKeys = uploadedFileInfos.filter(f => !f.error && !f.uploading).map(f => f.key);
    onSend(input, fileKeys);
    setInput("");
    setFiles([]);
    setFilePreviews([]);
    setUploadedFileInfos([]);
  };

  return (
    <ChatInputBox
      input={input}
      setInput={setInput}
      files={files}
      setFiles={setFiles}
      filePreviews={filePreviews}
      setFilePreviews={setFilePreviews}
      uploadedFileInfos={uploadedFileInfos}
      setUploadedFileInfos={setUploadedFileInfos}
      loading={loading}
      uploading={uploading}
      setUploading={setUploading}
      onSend={handleSend}
    />
  );
};

export default ChatInputBoxWrapper;
