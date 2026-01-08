import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Sparkles, PartyPopper } from "lucide-react";

interface RewardCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

export const RewardCelebration = ({ show, onComplete }: RewardCelebrationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setVisible(false)}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="bg-gradient-to-br from-violet-500 to-purple-600 p-8 rounded-3xl shadow-2xl text-white text-center max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, -100],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="absolute text-2xl"
                style={{
                  left: `${20 + i * 8}%`,
                  bottom: "20%",
                }}
              >
                {["✨", "🎉", "⭐", "🎊", "💫", "🌟", "🎁", "🤖"][i]}
              </motion.div>
            ))}

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
            >
              Reward Unlocked! 🎉
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-violet-100 mb-4"
            >
              You've earned 3 free AI agents when Elixa launches!
            </motion.p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex justify-center gap-2"
            >
              <span className="text-4xl">🤖</span>
              <span className="text-4xl">🤖</span>
              <span className="text-4xl">🤖</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-violet-200 mt-4"
            >
              Tap anywhere to close
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
