import React from 'react';
import { HouseState } from '../types';

interface WebGLFallbackProps {
  state: HouseState;
  onRetry: () => void;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({ state, onRetry }) => {
  return (
    <div className="sol-fallback">
      <div className="sol-fallback-card">
        <div className="sol-warning">!</div>
        <h2>3D recovery mode</h2>
        <p>The WebGL context paused or lost acceleration. Retry to restore the interactive scene.</p>
        <dl>
          <div><dt>View</dt><dd>{state.viewMode}</dd></div>
          <div><dt>Floor</dt><dd>{state.activeFloor}</dd></div>
          <div><dt>Progress</dt><dd>{state.constructionProgress}%</dd></div>
        </dl>
        <button className="sol-primary-button" onClick={onRetry}>Reload 3D graphics</button>
      </div>
    </div>
  );
};
