import React, { useState, useEffect } from 'react';

interface IntroScreenProps {
    onContinue: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onContinue }) => {
    const [showTitle, setShowTitle] = useState(false);
    const [showSubtitle, setShowSubtitle] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // ASCII art title (same as TitleScreen but animated)
    const asciiTitle = `
██████╗ ███████╗ █████╗ ██╗         ██████╗ ██████╗
 ██╔══██╗██╔════╝██╔══██╗██║        ██╔═══██╗██╔══██╗
 ██████╔╝█████╗  ███████║██║        ██║   ██║██████╔╝
 ██╔══██╗██╔══╝  ██╔══██║██║        ██║   ██║██╔══██╗
 ██║  ██║███████╗██║  ██║███████╗   ╚██████╔╝██║  ██║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝  ╚═╝

██████╗ ███████╗███╗   ██╗██████╗ ███████╗██████╗ ██╗
██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔════╝██╔══██╗██║
██████╔╝█████╗  ██╔██╗ ██║██║  ██║█████╗  ██████╔╝██║
██╔══██╗██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗╚═╝
██║  ██║███████╗██║ ╚████║██████╔╝███████╗██║  ██║██╗
╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝
`.trim();

    useEffect(() => {
        // Animate elements sequentially
        const timer1 = setTimeout(() => setShowTitle(true), 300);
        const timer2 = setTimeout(() => setShowSubtitle(true), 1000);
        const timer3 = setTimeout(() => setShowButton(true), 1800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const handleContinue = () => {
        setIsAnimating(true);
        setTimeout(onContinue, 300); // Brief animation before transition
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-full bg-background text-foreground p-3 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse"
                    style={{ animationDelay: '0s', animationDuration: '3s' }} />
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary/30 rounded-full animate-pulse"
                    style={{ animationDelay: '1s', animationDuration: '2s' }} />
                <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse"
                    style={{ animationDelay: '2s', animationDuration: '2.5s' }} />
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center z-10 max-w-md">
                {/* ASCII Art Title with animation */}
                <div className={`transition-all duration-1000 ease-out ${showTitle
                        ? 'opacity-100 transform translate-y-0'
                        : 'opacity-0 transform translate-y-4'
                    }`}>
                    <pre className="ascii-art text-primary text-center overflow-x-auto whitespace-pre font-mono leading-tight px-2 max-w-full text-[0.475rem] sm:text-xs mb-4 overflow-y-hidden">
                        {asciiTitle}
                    </pre>
                </div>

                {/* Subtitle with animation */}
                <div className={`transition-all duration-1000 ease-out ${showSubtitle
                        ? 'opacity-100 transform translate-y-0'
                        : 'opacity-0 transform translate-y-4'
                    }`}>
                    <div className="mb-6 text-center">
                        <p className="text-foreground/60 text-sm sm:text-base mb-2">
                            Welcome to the ultimate
                        </p>
                        <p className="text-foreground/60 text-sm sm:text-base mb-4">
                            AI vs Reality challenge!
                        </p>
                        <p className="text-foreground/40 text-xs sm:text-sm max-w-sm">
                            Test your perception and see if you can distinguish between real photographs and AI-generated images.
                        </p>
                    </div>
                </div>

                {/* Interactive Continue Button */}
                <div className={`transition-all duration-1000 ease-out ${showButton
                        ? 'opacity-100 transform translate-y-0'
                        : 'opacity-0 transform translate-y-4'
                    }`}>
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isAnimating}
                        className={`relative py-4 px-8 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg min-h-[52px] flex items-center justify-center gap-2 ${isAnimating ? 'scale-95 opacity-75' : 'hover:scale-105'
                            }`}
                    >
                        <span className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'
                            }`}>
                            Let's Play
                        </span>
                        <span className={`transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                            }`}>
                            Starting...
                        </span>
                        {!isAnimating && (
                            <span className="text-xl animate-bounce" style={{ animationDuration: '2s' }}>
                                →
                            </span>
                        )}
                    </button>

                    <p className="text-center text-foreground/50 text-xs mt-3">
                        Daily challenges • Compete on leaderboards
                    </p>
                </div>
            </div>
        </div>
    );
};
