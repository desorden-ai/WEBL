export default function HeroLighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={['#aeb8c0', '#263036', 0.45]} />
    </>
  );
}
