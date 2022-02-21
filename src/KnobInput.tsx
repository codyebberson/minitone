// Source: https://codepen.io/jhnsnc/pen/KXYayG
// TODO: add input label for screenreaders

import React, { useState } from 'react';
import { killEvent } from './dom';
import styles from './KnobInput.module.css';

interface KnobInputProps {
  min: number;
  max: number;
  initial: number;
  onChange: (value: number) => void;
}

export function KnobInput({ min, max, initial, onChange }: KnobInputProps): JSX.Element {
  const [value, setValue] = useState(initial);

  function handleMouseDown(downEvent: React.MouseEvent): void {
    killEvent(downEvent);

    const startValue = value;

    function handleMouseMove(moveEvent: MouseEvent): void {
      killEvent(moveEvent);
      const newValue = Math.max(min, Math.min(max, startValue - (moveEvent.clientY - downEvent.clientY) * 0.01));
      setValue(newValue);
      onChange(newValue);
    }

    function handleMouseUp(upEvent: MouseEvent): void {
      killEvent(upEvent);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.body.classList.remove('dragging');
    }

    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.body.classList.add('dragging');
  }

  function buildArcPath(value: number): string {
    const centerX = 20;
    const centerY = 20;
    const radius = 17.5;
    const theta = value * 2 * Math.PI * 0.9999;
    const startX = centerX;
    const startY = centerY + radius;
    const endX = centerX - radius * Math.sin(theta);
    const endY = centerY + radius * Math.cos(theta);
    return `M${startX},${startY}` + `A${radius},${radius} 0 ${value > 0.5 ? 1 : 0} 1 ${endX},${endY}`;
  }

  return (
    <div className={styles.container} style={{ position: 'absolute', top: '100px', left: '100px' }}>
      <svg className={styles.visual} viewBox="0 0 40 40">
        <circle className="focus-indicator" cx="20" cy="20" r="18" fill="#4eccff"></circle>
        <circle className="indicator-ring-bg" cx="20" cy="20" r="18" fill="#353b3f" stroke="#23292d"></circle>
        <path className="indicator-ring" d={buildArcPath(value)} stroke="#4eccff"></path>
        <g className="dial">
          <circle cx="20" cy="20" r="16" fill="url(#grad-dial-soft-shadow)"></circle>
          <ellipse cx="20" cy="22" rx="14" ry="14.5" fill="#242a2e" opacity="0.15"></ellipse>
          <circle cx="20" cy="20" r="14" fill="url(#grad-dial-base)" stroke="#242a2e" strokeWidth="1.5"></circle>
          <circle
            cx="20"
            cy="20"
            r="13"
            fill="transparent"
            stroke="url(#grad-dial-highlight)"
            strokeWidth="1.5"
          ></circle>
          <circle className="dial-highlight" cx="20" cy="20" r="14" fill="#ffffff"></circle>
          <circle
            className="indicator-dot"
            cx="20"
            cy="30"
            r="1.5"
            fill="#4eccff"
            style={{ transformOrigin: '20px 20px', transform: `rotate(${value * 360}deg)` }}
          ></circle>
        </g>
      </svg>
      <input
        className={styles.input}
        type="range"
        min={min}
        max={max}
        value={initial}
        onChange={(e) => {}}
        onTouchStart={(e) => {}}
        onTouchMove={(e) => {}}
        onTouchEnd={(e) => {}}
        onTouchCancel={(e) => {}}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {}}
        onMouseUp={(e) => {}}
        onWheel={(e) => {}}
        onDoubleClick={(e) => {}}
        onFocus={(e) => {}}
        onBlur={(e) => {}}
      />
    </div>
  );
}
