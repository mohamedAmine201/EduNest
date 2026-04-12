import React, { useState, useEffect } from "react";

interface TypewriterProps {
  words: string[];
  speed?: number; 
  pause?: number;
}

const Typewriter: React.FC<TypewriterProps> = ({ 
  words, 
  speed = 100, 
  pause = 1200 
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward
        if (charIndex < currentWord.length) {
          setCharIndex((prev) => prev + 1);
        } else {
          // Pause at the end of the word
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        // Deleting backward
        if (charIndex > 0) {
          setCharIndex((prev) => prev - 1);
        } else {
          // Move to next word in the list
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    // Make deleting slightly faster for a snappier feel
    const delta = isDeleting ? speed / 2 : speed;
    const timer = setTimeout(handleTyping, delta);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, words, speed, pause]);

  return (
    <span className="text-[var(--primary)] border-r-4 border-current animate-pulse min-h-[1em]">
      {words[wordIndex].substring(0, charIndex)}
    </span>
  );
};

export default Typewriter;