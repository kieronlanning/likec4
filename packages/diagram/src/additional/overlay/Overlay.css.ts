import { style } from '@vanilla-extract/css'
import { mantine } from '../../theme-vars'

export const dialog = style({
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  position: 'fixed',
  inset: '4rem 3rem 3rem 3rem',
  display: 'flex',
  alignItems: 'stretch',
  width: 'auto',
  height: 'auto',
  // width: '100%',
  // height: '100%',
  // maxWidth: '100%',
  // maxHeight: '100%',
  background: mantine.colors.body,
  boxShadow: mantine.shadows.xl,
  border: `3px solid ${mantine.colors.defaultBorder}`,
  borderRadius: mantine.radius.md,
  vars: {
    '--backdrop-opacity': '0%',
    '--backdrop-blur': '0px',
  },
  selectors: {
    [`&[open]`]: {
      // visibility: 'visible',
    },
    [`&::backdrop`]: {
      cursor: 'zoom-out',
      WebkitBackdropFilter: 'blur(var(--backdrop-blur))',
      backdropFilter: 'blur(var(--backdrop-blur))',
      backgroundColor: `rgb(0 0 0 / var(--backdrop-opacity))`,
    },
  },
})

export const body = style({
  flex: 1,
  width: '100%',
  height: '100%',
  // visibility: 'hidden',
  // selectors: {
  //   [`${dialog}[open] &`]: {
  //     visibility: 'visible',
  //   },
  // },
  // backgroundColor: 'red',
})
