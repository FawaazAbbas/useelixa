import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Image as ImageIcon, FileVideo, FileAudio } from 'lucide-react';

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FileMessageCardProps {
  files: FileAttachment[];
}

export const FileMessageCard = ({ files }: FileMessageCardProps) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <Card key={index} className="overflow-hidden">
          {isImage(file.type) ? (
            <div className="relative">
              <img
                src={file.url}
                alt={file.name}
                className="w-full max-h-[400px] object-contain"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                asChild
              >
                <a href={file.url} download={file.name}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          ) : (
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={file.url} download={file.name}>
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
