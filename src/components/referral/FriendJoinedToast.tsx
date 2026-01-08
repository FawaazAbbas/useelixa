import { motion } from "framer-motion";
import { UserPlus, Sparkles } from "lucide-react";

interface FriendJoinedToastProps {
  friendName: string;
  currentCount: number;
  targetCount: number;
}

export const FriendJoinedToast = ({ friendName, currentCount, targetCount }: FriendJoinedToastProps) => {
  const remaining = targetCount - currentCount;
  
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
        <UserPlus className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-sm">
          {friendName} joined! <Sparkles className="w-4 h-4 inline text-yellow-500" />
        </p>
        <p className="text-xs text-muted-foreground">
          {remaining > 0 
            ? `${remaining} more referral${remaining === 1 ? '' : 's'} to unlock your reward!`
            : "You've unlocked your reward! 🎉"
          }
        </p>
      </div>
    </motion.div>
  );
};
