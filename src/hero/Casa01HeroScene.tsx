import HeroCamera from './camera/HeroCamera';
import HeroEnvironment from './environment/HeroEnvironment';
import Casa01Architecture from './architecture/Casa01Architecture';
import HeroLighting from './lighting/HeroLighting';
import HeroAtmosphere from './lighting/HeroAtmosphere';

export default function Casa01HeroScene() {
  return (
    <>
      <HeroCamera />
      <HeroAtmosphere />
      <HeroLighting />
      <HeroEnvironment />
      <Casa01Architecture />
    </>
  );
}
