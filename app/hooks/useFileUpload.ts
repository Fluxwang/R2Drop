import axios, { Axios, AxiosProgressEvent } from "axios";
import { useState } from "react";

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setisUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (url: string, file: File): Promise<void> => {
    setisUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (ProgressEvent: AxiosProgressEvent) => {
          if (ProgressEvent.total) {
            const percent =
              Math.round(ProgressEvent.loaded * 100) / ProgressEvent.total;
          }
        },
      });
    } catch (error: unknown) {}
  };
}
