import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ElixaMascot, MascotPose } from "@/components/ElixaMascot";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  mascotPose?: MascotPose;
}

export const EmptyState = ({ icon, title, description, action, mascotPose = "search" }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {mascotPose ? (
        <ElixaMascot pose={mascotPose} size="xl" animation="float" className="mb-4" />
      ) : icon ? (
        <div className="text-6xl mb-4">{icon}</div>
      ) : null}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};