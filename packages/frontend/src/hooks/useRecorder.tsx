import { Api, RecordedFile } from "@forzautils/core";
import { useEffect, useState } from "react";

export interface Recorder {
  allFiles: RecordedFile[];
}

export function useRecorder(): Recorder {
  const [allFiles, setAllFiles] = useState<RecordedFile[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const response = await (new Api()).recorded.getAllPreviousRest();
      setAllFiles(response.data);
    }
    fetch();
  }, []);

  return {
    allFiles: allFiles
  }
}