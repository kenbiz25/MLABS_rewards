interface LogomarkProps {
  size?: number;
  className?: string;
}

// The multi-color Medtronic LABS icon (public/brand-icon.png). Full-color,
// so it reads fine on both white and solid-indigo backgrounds — there is no
// separate "white" variant.
export function Logomark({ size = 32, className }: LogomarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand-icon.png"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
      aria-hidden="true"
    />
  );
}

interface LogoLockupProps {
  height?: number;
  className?: string;
}

// The full "Medtronic LABS" wordmark + icon lockup (public/medtronic-labs-logo.png).
export function LogoLockup({ height = 28, className }: LogoLockupProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/medtronic-labs-logo.png"
      alt="Medtronic LABS"
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
