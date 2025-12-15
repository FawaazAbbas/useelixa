import { useEffect, useState } from "react";

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
    let timeout: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;
    
    // Start typing after delay
    timeout = setTimeout(() => {
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeout = setTimeout(typeNextChar, typingSpeed);
        } else {
          // Keep cursor blinking after typing is done
          cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
          }, 530);
        }
      };
      
      typeNextChar();
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (cursorInterval) clearInterval(cursorInterval);
    };
  }, [text, typingSpeed, startDelay]);

  return (
    <span className={className}>
      {displayedText}
      <span 
        className={`inline-block w-[3px] h-[0.9em] ml-0.5 align-middle bg-current transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
      />
    </span>
  );
};

