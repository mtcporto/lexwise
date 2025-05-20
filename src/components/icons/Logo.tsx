import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="LexWise Assistant Logo"
      {...props}
    >
      <style>
        {`
          .logo-text { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 30px; font-weight: 600; fill: hsl(var(--primary)); }
          .logo-text-secondary { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 30px; font-weight: 400; fill: hsl(var(--foreground)); }
          @media (prefers-color-scheme: dark) {
            .logo-text { fill: hsl(var(--primary)); }
            .logo-text-secondary { fill: hsl(var(--foreground)); }
          }
        `}
      </style>
      <text x="5" y="35" className="logo-text">
        Lex
      </text>
      <text x="60" y="35" className="logo-text-secondary">
        Wise
      </text>
    </svg>
  );
}
