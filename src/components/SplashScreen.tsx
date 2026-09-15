import { useEffect, useState } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2200;
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((previous) => {
        const next = previous + step;

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 250);
          return 100;
        }

        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="gateway-splash">
      <div className="splash-glow splash-glow-one" />
      <div className="splash-glow splash-glow-two" />

      <div className="splash-content">
        <div className="logo-wrapper">
          <div className="logo-ring logo-ring-one" />
          <div className="logo-ring logo-ring-two" />

          <img
            src="/logo.png"
            alt="Gateway Connect"
            className="gateway-splash-logo"
          />
        </div>

        <h1 className="gateway-title">
          GATEWAY
        </h1>

        <div className="gateway-connect">
          <span />
          CONNECT
          <span />
        </div>

        <p className="gateway-tagline">
          CONNECTING PEOPLE
          <br />
          TO A BRIGHTER FUTURE
        </p>

        <div className="loading-area">
          <div className="loading-text">
            Connecting...
          </div>

          <div className="loading-track">
            <div
              className="loading-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="loading-percent">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      <div className="splash-bottom">
        <span>SECURE</span>
        <span>•</span>
        <span>CONNECTED</span>
        <span>•</span>
        <span>TOGETHER</span>
      </div>
    </div>
  );
}
