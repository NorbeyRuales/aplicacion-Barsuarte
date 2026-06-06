interface SectionDividerProps {
  from?: string;
  to?: string;
  flip?: boolean;
  variant?: 'wave' | 'angle' | 'curve';
}

export function SectionDivider({
  from = '#ffffff',
  to = '#fdf4ff',
  flip = false,
  variant = 'wave',
}: SectionDividerProps) {
  const paths: Record<string, string> = {
    wave: 'M0,32 C180,96 360,-32 540,32 C720,96 900,-32 1080,32 L1080,80 L0,80 Z',
    angle: 'M0,0 L1080,60 L1080,80 L0,80 Z',
    curve: 'M0,40 Q540,80 1080,20 L1080,80 L0,80 Z',
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 80, background: to, marginTop: -1 }}
    >
      <svg
        viewBox="0 0 1080 80"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      >
        <path d={paths[variant]} fill={from} />
      </svg>
    </div>
  );
}
