import { useEffect, useMemo, useState } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  onComplete: () => void;
}

interface CrowdSilhouette {
  id: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 50 - 95
  scale: number;
  depth: 'far' | 'mid' | 'near';
  armPose: 'both-raised' | 'right-high' | 'left-high' | 'gentle-uplift' | 'heart-praise';
  swayClass: string;
  liftClass: string;
  delay: string;
  duration: string;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  // Animation Stages:
  // 1. 'flipping': Fast 700-page Bible riffle on the tilted altar with distant congregation (0ms - 2000ms)
  // 2. 'closing': Smooth heavy hard cover sweeps over spine pivot & closes flush onto the solid page (2000ms - 2650ms)
  // 3. 'standing': Closed Bible stands upright on the altar, then glides downward fading out (2650ms - 3400ms)
  // 4. 'revealed': Clean modern "Gateway Connect" with "SPIRIT | LOVE | GRACE" descends from above (3000ms - 4000ms)
  const [stage, setStage] = useState<'flipping' | 'closing' | 'standing' | 'revealed'>('flipping');

  // Generate 220 distinct worshippers for the atmospheric background gathering
  // Soft, blurred silhouettes with gentle CSS animations for heads and hands
  const worshippers = useMemo<CrowdSilhouette[]>(() => {
    const list: CrowdSilhouette[] = [];
    const count = 220;
    const poses: CrowdSilhouette['armPose'][] = [
      'both-raised',
      'both-raised',
      'right-high',
      'left-high',
      'gentle-uplift',
      'heart-praise',
      'both-raised',
      'right-high'
    ];

    for (let i = 0; i < count; i++) {
      // Depth stratification: 0 to 1
      const depthVal = Math.random();
      let depth: 'far' | 'mid' | 'near' = 'mid';
      let y = 60 + Math.random() * 34; // 60% to 94% height
      let scale = 0.75 + Math.random() * 0.45;

      if (depthVal < 0.35) {
        depth = 'far';
        y = 52 + Math.random() * 20; // 52% to 72%
        scale = 0.55 + Math.random() * 0.25;
      } else if (depthVal > 0.8) {
        depth = 'near';
        y = 75 + Math.random() * 22; // 75% to 97%
        scale = 1.05 + Math.random() * 0.35;
      }

      // Distribute evenly across horizontal width with natural clustering
      const x = (i / count) * 100 + (Math.random() * 3.5 - 1.75);

      const armPose = poses[Math.floor(Math.random() * poses.length)];
      const swayIdx = (i % 4) + 1;
      const liftIdx = (i % 3) + 1;
      const delay = (Math.random() * 4).toFixed(2) + 's';
      const duration = (3.6 + Math.random() * 2.8).toFixed(2) + 's';

      list.push({
        id: i,
        x,
        y,
        scale,
        depth,
        armPose,
        swayClass: `sway-${swayIdx}`,
        liftClass: `lift-${liftIdx}`,
        delay,
        duration,
      });
    }

    // Sort by depth so far worshippers render behind near worshippers
    return list.sort((a, b) => a.y - b.y);
  }, []);

  // Sequence Timers
  useEffect(() => {
    // 1. Cover smoothly sweeps shut over the solid final page at 2000ms
    const closeTimer = setTimeout(() => {
      setStage('closing');
    }, 2000);

    // 2. Stands upright facing the screen at 2650ms, then glides downward
    const standTimer = setTimeout(() => {
      setStage('standing');
    }, 2650);

    // 3. Clean Modern Gateway Connect descends from above at 3000ms
    const revealTimer = setTimeout(() => {
      setStage('revealed');
    }, 3000);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(standTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  // Progress Bar
  useEffect(() => {
    const duration = 3800;
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
    <div className="gateway-splash" id="gateway-splash-screen">
      {/* =========================================================
          1. SUBTLE, BLURRED GATHERING BACKGROUND (150-300 PEOPLE)
          GPU-accelerated CSS animated heads and hands, soft and atmospheric
          ========================================================= */}
      <div className="crowd-atmosphere-container" aria-hidden="true">
        <div className="sanctuary-haze-light" />
        <div className="sanctuary-warm-spotlights" />

        <div className="crowd-worshipper-field">
          {worshippers.map((w) => (
            <div
              key={w.id}
              className={`worshipper-node depth-${w.depth} ${w.swayClass}`}
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
                transform: `scale(${w.scale})`,
                animationDelay: w.delay,
                animationDuration: w.duration,
              }}
            >
              {/* Shoulders & Torso */}
              <div className="worshipper-body" />

              {/* Head with gentle rim glow */}
              <div className="worshipper-head" />

              {/* Raised Hands & Arms according to authentic worship gestures */}
              <div
                className={`worshipper-arms pose-${w.armPose} ${w.liftClass}`}
                style={{
                  animationDelay: w.delay,
                  animationDuration: w.duration,
                }}
              >
                {(w.armPose === 'both-raised' ||
                  w.armPose === 'left-high' ||
                  w.armPose === 'gentle-uplift') && (
                  <div className="arm arm-left">
                    <div className="arm-limb" />
                    <div className="arm-hand hand-glow" />
                  </div>
                )}

                {(w.armPose === 'both-raised' ||
                  w.armPose === 'right-high' ||
                  w.armPose === 'gentle-uplift' ||
                  w.armPose === 'heart-praise') && (
                  <div className="arm arm-right">
                    <div className="arm-limb" />
                    <div className="arm-hand hand-glow" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Soft atmospheric gradient veil keeping the center subtle & non-distracting */}
        <div className="crowd-central-soft-veil" />
      </div>

      {/* Sanctuary Overhead Volumetric Stage Light & Drifting Motes */}
      <div className="sanctuary-overhead-light" />
      <div className="golden-air-particles" />

      {/* =========================================================
          2. MAIN STAGE: ALTAR WITH SUBTLE TILT & 3D BIBLE
          ========================================================= */}
      <div className="splash-core-stage">
        <div className="bible-viewport-3d">
          {/* THE ALTAR PLATFORM (Subtle tilt beneath the Bible) */}
          <div className={`sanctuary-altar-rig stage-${stage}`}>
            {/* Altar Top Slab with soft gold-inlay bevel */}
            <div className="altar-surface-slab">
              <div className="altar-wood-grain" />
              <div className="altar-runner-fabric" />
              <div className="altar-gold-trim" />
              <div className="altar-ambient-glow" />
            </div>

            {/* Altar Front Bevel Face */}
            <div className="altar-front-lip" />
          </div>

          {/* THE 3D BIBLE RIG (Resting on the altar -> 700-page curl riffle -> Solid page settle -> Hard cover closes) */}
          <div className={`bible-rig-3d stage-${stage}`} id="bible-rig-element">
            {/* Soft Bible Ambient Drop Shadow on the Altar */}
            <div className={`bible-altar-contact-shadow stage-${stage}`} />

            <div className="bible-open-geometry">
              {/* CENTRAL REALISTIC LEATHER SPINE */}
              <div className="bible-spine-hub">
                <div className="spine-band band-1" />
                <div className="spine-band band-2" />
                <div className="spine-band band-3" />
                <div className="spine-band band-4" />
                <div className="spine-gold-line" />
              </div>

              {/* LEFT WING (Source of 700 pages: starts deep 26px, depletes as pages curl over) */}
              <div className="bible-wing wing-left">
                {/* Left Leather Bottom Cover (Becomes back cover when closed) */}
                <div
                  className={`leather-cover-sheet left-leather ${
                    stage !== 'flipping' ? 'left-cover-closed-tuck' : ''
                  }`}
                >
                  <div className="leather-grain-overlay" />
                  <div className="cover-filigree-border" />
                </div>

                {/* 700-Page Source Stack: thins down as pages curl across */}
                <div
                  className={`dense-700-page-stack depleting-stack ${
                    stage !== 'flipping' ? 'stack-hidden-closed' : ''
                  }`}
                >
                  <div className="page-stack-face" />
                  <div className="gilded-striations side-gild" />
                  <div className="gilded-striations bottom-gild" />
                  <div className="gilded-striations top-gild" />
                </div>
              </div>

              {/* RIGHT WING (Destination of 700 pages: expands into thick gilded block) */}
              <div className="bible-wing wing-right">
                {/* Right Bottom Leather Cover */}
                <div className="leather-cover-sheet right-leather">
                  <div className="leather-grain-overlay" />
                  <div className="cover-filigree-border" />
                </div>

                {/* 700-Page Target Stack: finishes on a solid, clean parchment page */}
                <div className="dense-700-page-stack expanding-stack">
                  {/* CLEAN SOLID PAGE (Warm parchment with subtle scripture print and golden edge) */}
                  <div className="solid-final-page">
                    <div className="solid-page-parchment" />
                    <div className="solid-page-golden-margin" />
                    <div className="solid-page-script-lines">
                      <span className="script-line l-1" />
                      <span className="script-line l-2" />
                      <span className="script-line l-3" />
                      <span className="script-line l-4" />
                      <span className="script-line l-5" />
                    </div>
                  </div>

                  {/* Dense 700-page gilded block edges */}
                  <div className="gilded-striations side-gild" />
                  <div className="gilded-striations bottom-gild" />
                  <div className="gilded-striations top-gild" />
                </div>
              </div>

              {/* ULTRA-DENSE RAPID-FIRE 700-PAGE PAGE-CURL CASCADE (28 curled turning leaves) */}
              <div
                className={`rapid-page-curl-cascade ${
                  stage !== 'flipping' ? 'riffle-hidden-closed' : ''
                }`}
              >
                {Array.from({ length: 28 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`curling-leaf curl-idx-${idx}`}
                  >
                    {/* Page mesh segments simulating authentic paper curvature & dynamic cylinder light */}
                    <div className="curling-leaf-face leaf-segment-inner">
                      <div className="page-curl-highlight" />
                    </div>
                    <div className="curling-leaf-face leaf-segment-outer">
                      <div className="page-curl-shadow" />
                    </div>
                  </div>
                ))}
              </div>

              {/* HEAVY FRONT HARD COVER (Smoothly sweeps around the center spine hinge and settles flush onto the solid page) */}
              <div
                className={`heavy-leather-front-cover ${
                  stage !== 'flipping' ? 'cover-is-closing' : ''
                }`}
              >
                <div className="front-cover-face front-cover-exterior">
                  <div className="leather-grain-overlay" />
                  <div className="cover-filigree-border" />
                  {/* Embossed Gold Cross */}
                  <div className="cover-embossed-cross">
                    <span className="cross-shaft-v" />
                    <span className="cross-shaft-h" />
                    <span className="cross-halo-gem" />
                  </div>
                  <div className="cover-latin-title">HOLY BIBLE</div>
                  {/* Corner brass protectors */}
                  <span className="brass-corner c-tl" />
                  <span className="brass-corner c-tr" />
                  <span className="brass-corner c-bl" />
                  <span className="brass-corner c-br" />
                </div>
                <div className="front-cover-face front-cover-lining" />
              </div>
            </div>
          </div>

          {/* =========================================================
              3. CLEAN MODERN BRANDING: DESCENDS BEAUTIFULLY FROM ABOVE
              ========================================================= */}
          <div
            className={`gateway-modern-branding ${
              stage === 'revealed' ? 'branding-active' : ''
            }`}
          >
            <div className="branding-celestial-burst" />

            <div className="brand-minimal-crest">
              <span className="crest-bar" />
              <span className="crest-star">✦</span>
              <span className="crest-bar" />
            </div>

            <h1 className="brand-title-primary">
              GATEWAY
            </h1>

            <div className="brand-subtitle-cluster">
              <span className="brand-line-accent" />
              <span className="brand-title-secondary">CONNECT</span>
              <span className="brand-line-accent" />
            </div>

            <p className="brand-tagline-text">
              SPIRIT | LOVE | GRACE
            </p>
          </div>
        </div>

        {/* 4. PROGRESS LOADER */}
        <div className="splash-progress-container">
          <div className="progress-status-caption">
            {stage === 'revealed'
              ? 'Entering Sanctuary...'
              : stage === 'standing'
              ? 'Connecting Fellowship...'
              : 'Opening the Scriptures...'}
          </div>

          <div className="progress-bar-rail">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="progress-value-text">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* 5. BOTTOM ASSURANCE BADGE */}
      <div className="splash-security-pill">
        <span>SECURE</span>
        <span>•</span>
        <span>CONNECTED</span>
        <span>•</span>
        <span>TOGETHER</span>
      </div>
    </div>
  );
}
