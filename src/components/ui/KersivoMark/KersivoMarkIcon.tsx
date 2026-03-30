import { KERSIVO_MARK_PATH } from "../../../site/brand-mark";

type Props = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function KersivoMarkIcon({ size = 16, strokeWidth = 1.2, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={KERSIVO_MARK_PATH}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}
