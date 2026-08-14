export default function HeroAtmosphere() {
  return (
    <>
      <color attach="background" args={['#30383d']} />
      <fog attach="fog" args={['#58636a', 45, 170]} />
    </>
  );
}
