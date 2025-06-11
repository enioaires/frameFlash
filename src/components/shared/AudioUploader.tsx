import { FileWithPath, useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";

import { AudioLinesIcon } from "lucide-react";
import { Button } from "../ui/button";

interface AudioUploaderProps {
  fieldChange: (files: FileWithPath[]) => void;
  audioUrl?: string;
}

const AudioUploader = ({ fieldChange, audioUrl }: AudioUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState(audioUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFiles(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));
    },
    [files]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
    },
    maxFiles: 1,
  });

  const removeAudio = () => {
    setFiles([]);
    setFileUrl(undefined);
    fieldChange([]);
  };

  return (
    <div className="w-full">
      {fileUrl ? (
        <div className="bg-dark-3 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-light-2 font-medium">Áudio selecionado</h4>
            <Button
              type="button"
              onClick={removeAudio}
              className="text-light-4 hover:text-red-500 text-sm"
              variant="ghost"
              size="sm"
            >
              Remover
            </Button>
          </div>
          
          <audio controls className="w-full">
            <source src={fileUrl} />
            Seu navegador não suporta o elemento de áudio.
          </audio>
          
          <p className="text-light-4 text-sm mt-2">
            Clique ou arraste outro arquivo para alterar
          </p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer p-8 border-2 border-dashed border-dark-4 hover:border-primary-500 transition-colors"
        >
          <input {...getInputProps()} className="cursor-pointer" />
          <div className="file_uploader-box">
            <AudioLinesIcon className="size-16 mb-4" color="#5c5c7a" />
            <h3 className="base-medium text-light-2 mb-2">
              Arraste o arquivo de áudio aqui
            </h3>
            <p className="text-light-4 small-regular mb-4">
              MP3, WAV, OGG, M4A (máx. 50MB)
            </p>
            <Button type="button" className="shad-button_dark_4">
              Ou selecione o arquivo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;