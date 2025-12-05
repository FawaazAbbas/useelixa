import { FileText, FileSpreadsheet, FileImage, FileVideo, FileArchive, FileCode, Presentation, Palette, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
  fileType: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const getIconByType = (type: string) => {
  const lowerType = type.toLowerCase();
  
  // PDF
  if (lowerType === 'pdf' || lowerType.includes('pdf')) {
    return { Icon: FileText, color: "text-red-500" };
  }
  
  // Spreadsheets - handle both extensions and descriptive types
  if (['xlsx', 'xls', 'csv', 'numbers', 'spreadsheet'].includes(lowerType) || lowerType.includes('spreadsheet')) {
    return { Icon: FileSpreadsheet, color: "text-green-500" };
  }
  
  // Documents - handle both extensions and descriptive types
  if (['docx', 'doc', 'txt', 'md', 'rtf', 'document'].includes(lowerType) || lowerType.includes('document') || lowerType.includes('word')) {
    return { Icon: FileText, color: "text-blue-500" };
  }
  
  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(lowerType)) {
    return { Icon: FileImage, color: "text-purple-500" };
  }
  
  // Videos
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(lowerType)) {
    return { Icon: FileVideo, color: "text-pink-500" };
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(lowerType)) {
    return { Icon: FileArchive, color: "text-amber-500" };
  }
  
  // Code files
  if (['json', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'yml', 'yaml', 'xml'].includes(lowerType)) {
    return { Icon: FileCode, color: "text-cyan-500" };
  }
  
  // Presentations
  if (['pptx', 'ppt', 'key'].includes(lowerType)) {
    return { Icon: Presentation, color: "text-orange-500" };
  }
  
  // Design files
  if (['fig', 'psd', 'ai', 'sketch', 'xd'].includes(lowerType)) {
    return { Icon: Palette, color: "text-violet-500" };
  }
  
  // Default
  return { Icon: File, color: "text-muted-foreground" };
};

export const FileIcon = ({ fileType, className, size = "md" }: FileIconProps) => {
  const { Icon, color } = getIconByType(fileType);
  
  return <Icon className={cn(sizeClasses[size], color, className)} />;
};

export default FileIcon;
