import React from 'react';
import { Casa01Environment } from './Casa01Environment';
import { TimeOfDay } from '../../types';

interface Casa01CinematicEnvironmentProps {
  timeOfDay: TimeOfDay;
}

export const Casa01CinematicEnvironment: React.FC<Casa01CinematicEnvironmentProps> = ({ timeOfDay }) => {
  return (
    <>
      <Casa01Environment timeOfDay={timeOfDay} />
      
      {/* Soft Cinematic Fill Light */}
      <pointLight
        position={[0, 12, 16]}
        color={timeOfDay === 'SUNSET' ? '#ffaa77' : timeOfDay === 'NIGHT' ? '#38557d' : '#d0e5f5'}
        intensity={0.4}
        distance={32}
      />
    </>
  );
};
