import React, { useState, useEffect } from "react";

interface TypewriterProps {
    text: string;
    speed?: number;   // typing speed in ms
    pause?: number;   // pause before switching direction in ms
    }

    const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 100, pause = 800 }) => {
    const [index, setIndex] = useState<number>(0);
    const [typing, setTyping] = useState<boolean>(true);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (typing) {
        if (index < text.length) {
            timer = setTimeout(() => setIndex(index + 1), speed);
        } else {
            timer = setTimeout(() => setTyping(false), pause);
        }
        } else {
        if (index > 0) {
            timer = setTimeout(() => setIndex(index - 1), speed);
        } else {
            timer = setTimeout(() => setTyping(true), pause);
        }
        }

        return () => clearTimeout(timer);
    }, [index, typing, text, speed, pause]);

    // derive displayed text directly from index
    const displayed = text.substring(0, index);

    return (
        <span className="text-[var(--primary)] border-r-4 border-current animate-pulse">
        {displayed}
        </span>
    );
};

export default Typewriter;
