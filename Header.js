import React, { useState, useEffect } from 'react';
import InstallPwaButton from './InstallPwaButton.js';

const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12C4 16.4183 7.58172 20 12 20C13.8557 20 15.5538 19.3464 16.8995 18.2574M18.8071 16.3492C19.563 15.228 20 13.6869 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12ZM4 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12C12 14.2091 10.2091 16 8 16C5.79086 16 4 14.2091 4 12C4 9.79086 5.79086 8 8 8C10.2091 8 12 9.79086 12 12Z" stroke="white" strokeWidth="2"/>
        <path d="M18 9L20 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);


const Header = () => {
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
      // This logic determines if the app is running in a shareable context
      const runningInTopFrame = window.self === window.top;
      const hostname = window.location.hostname;
      const isLikelyPublic = runningInTopFrame && (hostname.endsWith('.aistudio.app') || hostname.endsWith('.web.app') || hostname.endsWith('.github.io'));
      
      if (isLikelyPublic) {
          setShowShare(true);
      }
    }, []);

    const handleShare = async () => {
        const shareData = {
          title: 'Money Muffin',
          text: 'Попробуй это приложение для управления финансами!',
          url: window.location.href,
        };
    
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            // Fallback for browsers that don't support navigator.share
            await navigator.clipboard.writeText(window.location.href);
            alert('Ссылка скопирована в буфер обмена!');
          }
        } catch (err) {
            console.error('Ошибка при попытке поделиться:', err);
            // As a last resort, just copy the text if sharing fails
            try {
              await navigator.clipboard.writeText(window.location.href);
              alert('Не удалось поделиться, но ссылка скопирована!');
            } catch (copyErr) {
              console.error('Не удалось скопировать ссылку:', copyErr);
              alert('Не удалось поделиться или скопировать ссылку.');
            }
        }
    };

    return (
        <header className="bg-primary shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <LogoIcon />
                    <h1 className="text-xl font-bold text-white tracking-tight">
                        Money Muffin
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {showShare && (
                        <button
                            onClick={handleShare}
                            className="text-white p-2 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white transition-colors"
                            title="Поделиться"
                            aria-label="Поделиться приложением"
                        >
                            <ShareIcon />
                        </button>
                    )}
                    <InstallPwaButton />
                </div>
            </div>
        </header>
    );
};

export default Header;