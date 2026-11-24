interface KopilokoLogoProps {
  className?: string;
}

export function KopilokoLogo({ className = "h-10 w-10" }: KopilokoLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="12" fill="currentColor" />
      {/* Back coffee bean silhouette */}
      <g transform="translate(27 25) rotate(24)">
        <ellipse cx="0" cy="0" rx="8.5" ry="12" fill="#C67C4E" />
        <path
          d="M-0.5 -10.5C2.5 -4.5 -2.5 4.5 0.5 10.5"
          stroke="#2C1810"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
      {/* Front coffee bean silhouette */}
      <g transform="translate(19 22) rotate(-22)">
        <ellipse cx="0" cy="0" rx="9" ry="12.5" fill="#FAF5EE" />
        <path
          d="M-0.5 -11C2.5 -4.5 -2.5 4.5 0.5 11"
          stroke="#2C1810"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
