import { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
}

export const TypingText = ({ 
  text, 
  className = "", 
  typingSpeed = 80,
  startDelay = 300 
}: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    
    // Start typing after delay
    const startTyping = () => {
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          // Add slight randomness for quirky effect
          const randomDelay = typingSpeed + (Math.random() * 40 - 20);
          timeoutId = setTimeout(typeNextChar, randomDelay);
        } else {
          // Hide cursor after typing is complete
          setTimeout(() => setShowCursor(false), 500);
        }
      };
      
      timeoutId = setTimeout(typeNextChar, startDelay);
    };

    startTyping();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, typingSpeed, startDelay]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span className="animate-pulse ml-0.5 inline-block w-[3px] h-[0.9em] bg-current align-middle" />
      )}
    </span>
  );
};
