// @ts-nocheck

import type { SVGProps } from 'react'
const SvgXRay = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" {...props}>
    <defs>
      <linearGradient id="X-Ray_svg__a" x1="0%" x2="100%" y1="100%" y2="0%">
        <stop offset="0%" stopColor="#2E27AD" />
        <stop offset="100%" stopColor="#527FFF" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <path fill="url(#X-Ray_svg__a)" d="M0 0h80v80H0z" />
      <path
        fill="#FFF"
        d="M47.5 42.2h-2v13.883h-4v-9.916h-2v9.916h-4v-6.941h-2v6.941h-2v1.984h18v-1.984h-2zm8 7.438c0-7.929-6.505-14.38-14.5-14.38s-14.5 6.451-14.5 14.38c0 7.928 6.505 14.379 14.5 14.379s14.5-6.451 14.5-14.38m2 0C57.5 58.66 50.098 66 41 66s-16.5-7.34-16.5-16.362S31.902 33.275 41 33.275s16.5 7.34 16.5 16.363M68 38.702c0 5.657-3.132 9.336-8.591 10.092l-.277-1.965C62.266 46.396 66 44.634 66 38.702c0-5.568-4.247-7.583-7.809-8.292a.99.99 0 0 1-.801-.916c-.234-4.073-2.645-5.896-4.932-5.896-1.437 0-2.777.671-3.676 1.842-.22.288-.585.433-.943.38a1 1 0 0 1-.79-.637c-.81-2.168-2.01-4.06-3.47-5.469-3.838-3.711-9.09-4.72-14.049-2.695-4.117 1.675-7.342 6.495-7.342 10.974 0 .503.031 1.003.091 1.488a.99.99 0 0 1-.752 1.084c-2.437.6-6.527 2.443-6.527 8.06 0 .212.011.403.021.604.183 3.292 3.047 6.315 6.966 7.351l-.515 1.916c-4.744-1.254-8.218-5.02-8.448-9.16a13 13 0 0 1-.024-.71c0-6.491 4.538-8.898 7.216-9.752a14 14 0 0 1-.028-.881c0-5.312 3.69-10.817 8.582-12.808 5.718-2.337 11.778-1.175 16.205 3.11 1.338 1.29 2.481 2.924 3.351 4.778a6.56 6.56 0 0 1 4.132-1.459c3.072 0 6.295 2.177 6.862 7.013 5.606 1.35 8.68 4.904 8.68 10.075"
      />
    </g>
  </svg>
)
export default SvgXRay
