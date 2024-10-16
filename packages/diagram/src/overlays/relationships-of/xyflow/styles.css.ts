import { style } from '@vanilla-extract/css'
import { mantine, vars, whereLight, xyvars } from '../../../theme-vars'

export const elementNode = style({
  // position: 'relative',
  width: '100%',
  height: '100%'
})

// globalStyle(`${elementNode} > *`, {
//   opacity: 1,
//   transition: 'all 0.2s ease-in-out',
//   transitionDelay: '50ms',
// })
// globalStyle(`${elementNode}:is([data-node-dimmed='true']) > *`, {
//   opacity: 0.2,
//   transitionDuration: '600ms'
// })

export const elementNodeContent = style({
  // position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 6,
  padding: 16
})

export const elementNodeTitle = style({
  flex: '0 0 auto',
  width: 'fit-content',
  textAlign: 'center',
  fontFamily: vars.element.font,
  fontOpticalSizing: 'auto',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: 17,
  lineHeight: 1.25,
  textWrap: 'balance',
  color: vars.element.hiContrast
})

export const elementNodeDescription = style({
  flex: '0 0 auto',
  width: 'fit-content',
  textAlign: 'center',
  fontFamily: vars.element.font,
  fontOpticalSizing: 'auto',
  fontStyle: 'normal',
  fontSize: mantine.fontSizes.xs,
  lineHeight: 1.25,
  textWrap: 'balance',
  color: vars.element.loContrast
})

export const compoundNodeBody = style({
  width: '100%',
  height: '100%',
  boxShadow: '0 4px 10px 0.5px rgba(0,0,0,0.1) , 0 2px 2px -1px rgba(0,0,0,0.4)',
  background: `color-mix(in srgb , ${vars.element.fill},  transparent 45%)`,
  borderRadius: 4
})

export const compoundNodeTitle = style({
  // flex: '0 0 auto',
  fontFamily: vars.compound.font,
  fontOpticalSizing: 'auto',
  fontStyle: 'normal',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: 1,
  textTransform: 'uppercase',
  paddingTop: 12,
  paddingLeft: 10,
  mixBlendMode: 'screen',
  color: vars.compound.titleColor,
  selectors: {
    [`${whereLight} &`]: {
      mixBlendMode: 'darken',
      color: vars.element.stroke
    }
  }
})

export const cssShapeSvg = style({
  top: 0,
  left: 0,
  position: 'absolute',
  pointerEvents: 'none',
  fill: vars.element.fill,
  stroke: vars.element.stroke,
  overflow: 'visible',
  filter: `
      drop-shadow(0 2px 1px rgba(0, 0, 0, 0.21))
      drop-shadow(0 1px 1px color-mix(in srgb, ${vars.element.stroke} 40%, transparent))
      drop-shadow(0 5px 3px rgba(0, 0, 0, 0.1))
    `,
  zIndex: -1
})

export const edgePath = style({
  opacity: 1,
  transition: 'all 0.2s ease-in-out',

  selectors: {
    [`&[data-edge-dimmed='true']`]: {
      opacity: 0.1,
      transitionDelay: '800ms'
    }
  }
})

export const edgeLabel = style({
  padding: '2px 5px',
  fontFamily: vars.likec4.font,
  position: 'absolute',
  cursor: 'pointer',
  width: 'fit-content',
  color: xyvars.edge.labelColor,
  backgroundColor: xyvars.edge.labelBgColor,
  borderRadius: 4,
  // everything inside EdgeLabelRenderer has no pointer events by default
  // if you have an interactive element, set pointer-events: all
  pointerEvents: 'all',
  textWrap: 'pretty',
  whiteSpace: 'preserve-breaks',
  opacity: 1,
  transition: 'all 0.2s ease-in-out',
  selectors: {
    [`&[data-edge-dimmed='true']`]: {
      opacity: 0.1,
      // transitionDuration: '400ms',
      transitionDelay: '800ms'
    }
  }
})

export const edgeLabelText = style({
  textAlign: 'center',
  whiteSpaceCollapse: 'preserve-breaks',
  fontSize: mantine.fontSizes.sm,
  lineHeight: mantine.lineHeights.xs
})

export const emptyNode = style({
  width: '100%',
  height: '100%',
  border: `3px dashed ${mantine.colors.defaultBorder}`,
  borderRadius: mantine.radius.md,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

export const navigateBtnBox = style({
  zIndex: 100,
  position: 'absolute',
  left: '50%',
  bottom: 2,
  transform: 'translate(-50%, 0%)',
  selectors: {
    [`:where([data-likec4-shape='browser']) &`]: {
      bottom: 4
    }
  }
})
export const navigateBtn = style({
  pointerEvents: 'all',
  color: vars.element.loContrast,
  cursor: 'pointer',
  backgroundColor: 'var(--ai-bg)',
  'vars': {
    '--ai-bg': `color-mix(in srgb , ${vars.element.fill},  transparent 99%)`,
    '--ai-bg-hover': `color-mix(in srgb , ${vars.element.fill} 65%, ${vars.element.stroke})`,
    '--ai-hover': `color-mix(in srgb , ${vars.element.fill} 50%, ${vars.element.stroke})`
  },
  ':hover': {
    boxShadow: mantine.shadows.md
  }
})
