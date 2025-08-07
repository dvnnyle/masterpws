import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function SocialWidget() {
  const tiktokRef = useRef(null);
  const [igLoaded, setIgLoaded] = useState(false);
  const [ttLoaded, setTtLoaded] = useState(false);
  const [igError, setIgError] = useState(false);
  const [ttError, setTtError] = useState(false);

  // Preload TikTok script immediately
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = 'https://www.tiktok.com/embed.js';
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  // TikTok loading with intersection observer
  useEffect(() => {
    let script;
    let timeout;

    const loadTikTok = () => {
      const prev = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (prev) prev.remove();

      script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      
      script.onload = () => {
        setTtLoaded(true);
        clearTimeout(timeout);
      };
      
      script.onerror = () => {
        setTtError(true);
        clearTimeout(timeout);
      };

      if (tiktokRef.current) {
        tiktokRef.current.parentNode.appendChild(script);
      } else {
        document.body.appendChild(script);
      }

      timeout = setTimeout(() => {
        if (!ttLoaded) setTtLoaded(true);
      }, 800);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadTikTok();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (tiktokRef.current) {
      observer.observe(tiktokRef.current);
    }

    return () => {
      if (script) script.remove();
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [ttLoaded]);

  const handleIgLoad = useCallback(() => {
    setIgLoaded(true);
  }, []);

  const handleIgError = useCallback(() => {
    setIgError(true);
  }, []);

  // Shared card style - WHITE background and same size as iframe
  const cardStyle = {
    width: '100%',
    height: '454px',
    borderRadius: 20,
    background: '#ffffff',        // WHITE background
    border: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '16px',
    fontWeight: '500',
    position: 'absolute',         // Always absolute positioning
    top: 0,
    left: 0,
    zIndex: 1                     // Behind iframe
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 'calc(100% - 24px)', 
      margin: '0px auto 12px auto',
      gap: '10px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Instagram Section */}
      <div style={{ position: 'relative', marginTop: '10px', height: '454px' }}>
        {/* Static WHITE Card Background - Always visible */}
        <div style={cardStyle}>
          Loading...
        </div>
        
        <iframe
          title="Instagram Feed"
          src="https://www.instagram.com/playworld.kristiansand/embed"
          width="100%"
          height="454"
          style={{ 
            border: 0, 
            borderRadius: 20, 
            overflow: 'hidden', 
            width: '100%', 
            opacity: igLoaded ? 1 : 0, 
            transition: 'opacity 0.3s',
            display: igError ? 'none' : 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2                 // Above static card
          }}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          loading="eager"
          onLoad={handleIgLoad}
          onError={handleIgError}
        />
        
        {igError && (
          <div style={{
            ...cardStyle,
            flexDirection: 'column',
            gap: '10px',
            zIndex: 3                 // Above everything when error
          }}>
            <div>Instagram unavailable</div>
            <a 
              href="https://www.instagram.com/playworld.kristiansand" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#20b14c', textDecoration: 'none', fontSize: '14px' }}
            >
              Visit Instagram →
            </a>
          </div>
        )}
      </div>

      {/* TikTok Section */}
      <div style={{ position: 'relative', height: '454px' }}>
        {/* Static WHITE Card Background - Always visible */}
        <div style={cardStyle}>
          Loading...
        </div>

        <blockquote
          ref={tiktokRef}
          className="tiktok-embed"
          cite="https://www.tiktok.com/@playworld_kristiansand"
          data-unique-id="playworld_kristiansand"
          data-embed-type="creator"
          style={{ 
            border: 0, 
            borderRadius: 20, 
            overflow: 'hidden', 
            width: '100%', 
            height: '454px', 
            background: 'transparent', 
            opacity: ttLoaded ? 1 : 0, 
            transition: 'opacity 0.3s',
            display: ttError ? 'none' : 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            margin: 0,
            zIndex: 2                 // Above static card
          }}
        >
          <section>
            <a target="_blank" rel="noreferrer" href="https://www.tiktok.com/@playworld_kristiansand?refer=creator_embed">
              @playworld_kristiansand
            </a>
          </section>
        </blockquote>

        {ttError && (
          <div style={{
            ...cardStyle,
            flexDirection: 'column',
            gap: '10px',
            zIndex: 3                 // Above everything when error
          }}>
            <div>TikTok unavailable</div>
            <a 
              href="https://www.tiktok.com/@playworld_kristiansand" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#20b14c', textDecoration: 'none', fontSize: '14px' }}
            >
              Visit TikTok →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}