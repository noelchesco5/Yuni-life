import React from 'react';
import './Graffiti.css';

export type GraffitiType =
  | 'underline-scribble'
  | 'circle-sketch'
  | 'arrow-curved'
  | 'arrow-direct'
  | 'star-burst'
  | 'sparkle'
  | 'spray-splat'
  | 'tag-mambo'
  | 'tag-hop'
  | 'tag-poa'
  | 'tag-sawa'
  | 'tag-yuni'
  | 'smile-underline';

interface GraffitiProps {
  type: GraffitiType;
  color?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

export function Graffiti({
  type,
  color = 'var(--yuni-sun)',
  className = '',
  width,
  height,
  style = {},
}: GraffitiProps) {
  const combinedClass = `graffiti graffiti--${type} ${className}`.trim();

  switch (type) {
    case 'underline-scribble':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 140 18"
          fill="none"
          width={width || 120}
          height={height || 14}
          style={style}
          aria-hidden="true"
        >
          <path
            d="M3 12C35 4 80 5 137 11C102 16 55 15 15 13"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="graffiti-stroke"
          />
        </svg>
      );

    case 'smile-underline':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 80 12"
          fill="none"
          width={width || 70}
          height={height || 10}
          style={style}
          aria-hidden="true"
        >
          <path
            d="M4 3C25 10 55 10 76 3"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            className="graffiti-stroke"
          />
        </svg>
      );

    case 'circle-sketch':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 110 50"
          fill="none"
          width={width || 90}
          height={height || 40}
          style={style}
          aria-hidden="true"
        >
          <path
            d="M12 25C10 12 30 5 60 5C92 5 106 15 104 30C101 42 75 46 45 45C20 44 6 36 8 22C9 14 24 8 46 7"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="graffiti-stroke"
          />
        </svg>
      );

    case 'arrow-curved':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 50 45"
          fill="none"
          width={width || 38}
          height={height || 34}
          style={style}
          aria-hidden="true"
        >
          <path
            d="M6 38C12 22 24 10 42 8M42 8L31 5M42 8L37 19"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="graffiti-stroke"
          />
        </svg>
      );

    case 'arrow-direct':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 40 24"
          fill="none"
          width={width || 32}
          height={height || 20}
          style={style}
          aria-hidden="true"
        >
          <path
            d="M3 12H35M35 12L25 4M35 12L25 20"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="graffiti-stroke"
          />
        </svg>
      );

    case 'star-burst':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 36 36"
          fill="none"
          width={width || 24}
          height={height || 24}
          style={style}
          aria-hidden="true"
        >
          <path
            d="M18 2L20.5 13L31 10.5L23 18L31 25.5L20.5 23L18 34L15.5 23L5 25.5L13 18L5 10.5L15.5 13Z"
            fill={color}
            className="graffiti-pop"
          />
        </svg>
      );

    case 'sparkle':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 24 24"
          fill="none"
          width={width || 20}
          height={height || 20}
          style={style}
          aria-hidden="true"
        >
          <path
            d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z"
            fill={color}
            className="graffiti-pop"
          />
        </svg>
      );

    case 'spray-splat':
      return (
        <svg
          className={combinedClass}
          viewBox="0 0 48 48"
          fill="none"
          width={width || 36}
          height={height || 36}
          style={style}
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="8" fill={color} />
          <circle cx="37" cy="18" r="3" fill={color} />
          <circle cx="12" cy="14" r="2.5" fill={color} />
          <circle cx="34" cy="34" r="2" fill={color} />
          <circle cx="15" cy="35" r="3.5" fill={color} />
          <circle cx="24" cy="9" r="2" fill={color} />
          <circle cx="22" cy="39" r="1.5" fill={color} />
        </svg>
      );

    case 'tag-mambo':
      return (
        <span className={combinedClass} style={{ color, ...style }}>
          Mambo!
        </span>
      );

    case 'tag-hop':
      return (
        <span className={combinedClass} style={{ color, ...style }}>
          Hop!
        </span>
      );

    case 'tag-poa':
      return (
        <span className={combinedClass} style={{ color, ...style }}>
          Poa ✦
        </span>
      );

    case 'tag-sawa':
      return (
        <span className={combinedClass} style={{ color, ...style }}>
          Sawa!
        </span>
      );

    case 'tag-yuni':
      return (
        <span className={combinedClass} style={{ color, ...style }}>
          yuni~
        </span>
      );

    default:
      return null;
  }
}
