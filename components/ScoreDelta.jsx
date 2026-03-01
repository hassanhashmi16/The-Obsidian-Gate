import React, { useEffect, useState } from 'react';

export default function ScoreDelta({ delta }) {
    const [show, setShow] = useState(false);
    const [currentDelta, setCurrentDelta] = useState(0);

    useEffect(() => {
        if (delta !== 0 && delta !== null && delta !== undefined) {
            setCurrentDelta(delta);
            setShow(true);

            const timer = setTimeout(() => {
                setShow(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [delta]);

    if (!show) return null;

    const isPositive = currentDelta > 0;
    const textColor = isPositive ? "text-emerald-400" : "text-red-400";
    const displaySign = isPositive ? "+" : "";

    return (
        <div className={`absolute -top-6 right-0 font-[family-name:var(--font-inter)] font-bold text-sm tracking-wide ${textColor} animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_reverse]`}>
            {displaySign}{currentDelta}
        </div>
    );
}
