import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { debugFlags } from '../lib/debugFlags';

export default function SplitScreenEntry({
  leftVideo = '/loops/hero.mp4',
  rightVideo = '/loops/p2w-arcana.mp4',
  leftPoster = '/speed-poster.jpg',
  rightPoster = '/focus-poster.jpg',
  selectedPath = null,
  onSelectPath,
}) {
  const [hoveredSide, setHoveredSide] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);
  const containerRef = useRef(null);
  const leftVideoRef = useRef(null);
  const rightVideoRef = useRef(null);
  const [sectionTop, setSectionTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!selectedPath) {
      setSelectedSide(null);
      setHoveredSide(null);
    } else {
      setSelectedSide(selectedPath === 'speed' ? 'left' : 'right');
    }
  }, [selectedPath]);

  const leftSize = selectedSide === 'left'
    ? '100%'
    : selectedSide === 'right'
      ? '0%'
      : hoveredSide === 'left'
        ? '70%'
        : hoveredSide === 'right'
          ? '30%'
          : '50%';
  const rightSize = selectedSide === 'right'
    ? '100%'
    : selectedSide === 'left'
      ? '0%'
      : hoveredSide === 'right'
        ? '70%'
        : hoveredSide === 'left'
          ? '30%'
          : '50%';

  const handleClick = (side) => {
    setSelectedSide(side);
    if (onSelectPath) onSelectPath(side === 'left' ? 'speed' : 'focus');
  };

  const handleSidePress = (side) => {
    if (isMobile && !selectedSide && hoveredSide !== side) {
      setHoveredSide(side);
      return;
    }
    handleClick(side);
  };

  const handleUnselect = () => {
    setSelectedSide(null);
    setHoveredSide(null);
    if (onSelectPath) onSelectPath(null);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedSide) handleUnselect();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSide]);

  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) setSectionTop(containerRef.current.offsetTop);
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Paused until the user hovers / selects a side.
  // Priority: selected (post-click) > hovered.
  useEffect(() => {
    const playing = selectedSide || hoveredSide;
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;

    if (left) {
      if (playing === 'left') left.play().catch(() => {});
      else {
        left.pause();
        try { left.currentTime = 0; } catch (error) { /* ignore seek restrictions */ }
      }
    }
    if (right) {
      if (playing === 'right') right.play().catch(() => {});
      else {
        right.pause();
        try { right.currentTime = 0; } catch (error) { /* ignore seek restrictions */ }
      }
    }
  }, [hoveredSide, selectedSide]);

  const videoStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const baseOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  };

  // When one side is hovered, the OTHER side's label dims + shrinks.
  // Same treatment when one side is selected.
  const labelStyleFor = (side) => {
    const active = selectedSide === side || (!selectedSide && hoveredSide === side);
    const other = (selectedSide || hoveredSide) && !active;
    return {
      color: 'white',
      fontFamily: 'var(--display)',
      fontSize: 'clamp(44px, 8vw, 132px)',
      fontWeight: 400,
      textTransform: 'uppercase',
      letterSpacing: '0',
      lineHeight: 0.88,
      textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      opacity: selectedSide ? 0 : (other ? 0.35 : 1),
      transform: other ? 'scale(0.78)' : 'scale(1)',
      transformOrigin: 'center',
      transition: 'opacity 0.45s cubic-bezier(.2,.6,.2,1), transform 0.45s cubic-bezier(.2,.6,.2,1)',
    };
  };

  return (
    <section
      data-section="choice"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        background: '#000',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: isMobile ? '100%' : leftSize,
          height: isMobile ? leftSize : '100%',
          overflow: 'hidden',
          transition: isMobile
            ? 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        }}
        onMouseEnter={() => !selectedSide && setHoveredSide('left')}
        onMouseLeave={() => !selectedSide && setHoveredSide(null)}
        onClick={() => handleSidePress('left')}
      >
        {!debugFlags.noVideos && (
          <video ref={leftVideoRef} loop muted playsInline preload="metadata" poster={leftPoster} style={videoStyle}>
            <source src={leftVideo} type="video/mp4" />
          </video>
        )}
        <div
          style={{
            ...baseOverlayStyle,
            backgroundColor: hoveredSide === 'left' || selectedSide === 'left'
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={labelStyleFor('left')}>Speed</div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          flex: isMobile ? 'none' : 1,
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? rightSize : '100%',
          overflow: 'hidden',
          transition: isMobile ? 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
          cursor: 'pointer',
        }}
        onMouseEnter={() => !selectedSide && setHoveredSide('right')}
        onMouseLeave={() => !selectedSide && setHoveredSide(null)}
        onClick={() => handleSidePress('right')}
      >
        {!debugFlags.noVideos && (
          <video ref={rightVideoRef} loop muted playsInline preload="metadata" poster={rightPoster} style={videoStyle}>
            <source src={rightVideo} type="video/mp4" />
          </video>
        )}
        <div
          style={{
            ...baseOverlayStyle,
            backgroundColor: hoveredSide === 'right' || selectedSide === 'right'
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={labelStyleFor('right')}>Focus</div>
        </div>
      </div>

    </section>
  );
}
