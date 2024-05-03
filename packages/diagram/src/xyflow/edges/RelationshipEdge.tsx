import { invariant, type NonEmptyArray, nonNullable, type Point } from '@likec4/core'
import { Box } from '@mantine/core'
import type { EdgeProps, XYPosition } from '@xyflow/react'
import { EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import clsx from 'clsx'
import { deepEqual as eq } from 'fast-equals'
import { type CSSProperties, memo } from 'react'
import { hasAtLeast } from 'remeda'
import { useDiagramState } from '../../state'
import { ZIndexes } from '../const'
import { useXYStoreApi } from '../hooks'
import { type XYFlowEdge } from '../types'
import { container, cssEdgePath, edgeLabel, edgeLabelBody, edgePathBg, fillStrokeCtx } from './edges.css'
import { getEdgeParams } from './utils'
// import { getEdgeParams } from './utils'

// function getBend(a: XYPosition, b: XYPosition, c: XYPosition, size = 8): string {
//   const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size)
//   const { x, y } = b
//   // no bend
//   if ((a.x === x && x === c.x) || (a.y === y && y === c.y)) {
//     return `L${x} ${y}`
//   }

//   // first segment is horizontal
//   if (a.y === y) {
//     const xDir = a.x < c.x ? -1 : 1
//     const yDir = a.y < c.y ? 1 : -1
//     return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`
//   }

//   const xDir = a.x < c.x ? 1 : -1
//   const yDir = a.y < c.y ? -1 : 1
//   return `L ${x},${y + bendSize * yDir}Q ${x},${y} ${x + bendSize * xDir},${y}`
// }

// const reduceToPath = (path: string, p: XYPosition, i: number, points: XYPosition[]) => {
//   let segment = ''
//   if (i > 0 && i < points.length - 1) {
//     segment = getBend(points[i - 1]!, p, points[i + 1]!)
//   } else {
//     segment = `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`
//   }
//   return path + segment
// }

function bezierPath(bezierSpline: NonEmptyArray<Point>) {
  let [start, ...points] = bezierSpline
  invariant(start, 'start should be defined')
  let path = `M ${start[0]},${start[1]}`

  while (hasAtLeast(points, 3)) {
    const [cp1, cp2, end, ...rest] = points
    path = path + ` C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${end[0]},${end[1]}`
    points = rest
  }
  invariant(points.length === 0, 'all points should be consumed')

  return path
}

const isEqualProps = (prev: EdgeProps<XYFlowEdge>, next: EdgeProps<XYFlowEdge>) => (
  prev.id === next.id
  && prev.source === next.source
  && prev.target === next.target
  && prev.sourceX === next.sourceX
  && prev.sourceY === next.sourceY
  && prev.targetX === next.targetX
  && prev.targetY === next.targetY
  && eq(prev.data, next.data)
)

function isSamePoint(a: XYPosition, b: Point) {
  return a.x === b[0] && a.y === b[1]
}

export const RelationshipEdge = /* @__PURE__ */ memo<EdgeProps<XYFlowEdge>>(function RelationshipEdgeR({
  id,
  data,
  selected,
  markerEnd,
  style,
  source,
  target,
  interactionWidth
}) {
  const { nodeLookup } = useXYStoreApi().getState()
  const sourceNode = nonNullable(nodeLookup.get(source)!, `source node ${source} not found`)
  const targetNode = nonNullable(nodeLookup.get(target)!, `target node ${target} not found`)

  const isNotModified = isSamePoint(sourceNode.internals.positionAbsolute, sourceNode.data.element.position)
    && isSamePoint(targetNode.internals.positionAbsolute, targetNode.data.element.position)

  invariant(data, 'data is required')
  const {
    edge,
    controlPoints
  } = data
  // const edgePath = bezierPath(edge.points)

  const color = edge.color ?? 'gray'
  const isHovered = useDiagramState(s => s.hoveredEdgeId === id)

  const line = edge.line ?? 'dashed'
  const isDotted = line === 'dotted'
  const isDashed = isDotted || line === 'dashed'

  let strokeDasharray: string | undefined
  if (isDotted) {
    strokeDasharray = '1,8'
  } else if (isDashed) {
    strokeDasharray = '8,10'
  }

  const marker = `url(#arrow-${id})`

  let edgePath: string, labelX: number, labelY: number

  if (isNotModified) {
    edgePath = bezierPath(edge.points)
    labelX = data.label?.bbox.x ?? 0
    labelY = data.label?.bbox.y ?? 0
  } else {
    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode)

    const [_edgePath, _labelX, _labelY] = getBezierPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      targetX: tx,
      targetY: ty
    })
    edgePath = _edgePath
    labelX = _labelX
    labelY = _labelY
  }
  // const deferredEdgePath = edgePath
  //   useTilg()`
  //   ${id}
  //   path=${edgePath}
  //   isModified=${isModified}
  // `

  return (
    <g className={clsx(container)} data-likec4-color={color} data-edge-hovered={isHovered}>
      <g className={clsx(fillStrokeCtx)}>
        <defs>
          <marker
            id={`arrow-${id}`}
            viewBox="0 0 10 8"
            refX="0"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            markerUnits="strokeWidth"
            preserveAspectRatio="xMaxYMid meet"
            orient="auto-start-reverse">
            <path d="M 0 0 L 10 4 L 0 8 z" stroke="context-stroke" fill="context-stroke" />
          </marker>
        </defs>
      </g>
      <RelationshipPath
        edgePath={edgePath}
        interactionWidth={interactionWidth ?? 10}
        strokeDasharray={strokeDasharray}
        markerStart={edge.tailArrow ? marker : undefined}
        markerEnd={edge.headArrow ? marker : undefined}
        style={style} />
      {
        /*
      {controlPoints.map((p, i) => (
        <circle
          className={styles.controlPoint}
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={5}
        />
      ))} */
      }
      {data.label && (
        <EdgeLabelRenderer>
          <Box
            className={clsx(container, edgeLabel)}
            data-likec4-color={color}
            style={{
              top: labelY,
              left: labelX,
              maxWidth: data.label.bbox.width + 10,
              zIndex: ZIndexes.Edge
            }}
            mod={{
              'data-edge-hovered': isHovered
            }}
          >
            <Box className={edgeLabelBody}>
              {data.label.text}
            </Box>
            {
              /* <Popover
                position="bottom"
                floatingStrategy="fixed"
                shadow="lg"
                disabled={!selected}
                transitionProps={{
                  transition: 'pop'
                }}>
                <Popover.Target>
                  <Box className={clsx('nodrag nopan', edgeLabelBody)}>
                    {data.label.text}
                  </Box>
                </Popover.Target>
                <Popover.Dropdown>
                  {edge.relations.map((relation) => (
                    <Box key={relation}>
                      <Text size='xs'>{relation}</Text>
                    </Box>
                  ))}
                  <TextInput label="Name" placeholder="Name" size="xs" />
                  <TextInput label="Email" placeholder="john@doe.com" size="xs" mt="xs" />
                </Popover.Dropdown>
              </Popover> */
            }
          </Box>
        </EdgeLabelRenderer>
      )}
    </g>
  )
}, isEqualProps)

const RelationshipPath = memo<{
  edgePath: string
  interactionWidth: number
  strokeDasharray: string | undefined
  markerStart: string | undefined
  markerEnd: string | undefined
  style: CSSProperties | undefined
}>(({
  edgePath,
  interactionWidth,
  strokeDasharray,
  markerStart,
  markerEnd,
  style
}) => (
  <>
    <path
      className={clsx('react-flow__edge-path', edgePathBg)}
      d={edgePath}
      style={style}
      strokeLinecap={'round'}
    />
    <path
      className={clsx('react-flow__edge-path', cssEdgePath)}
      d={edgePath}
      style={style}
      strokeLinecap={'round'}
      strokeDasharray={strokeDasharray}
      markerStart={markerStart}
      markerEnd={markerEnd}
    />
    <path
      className={clsx('react-flow__edge-interaction')}
      d={edgePath}
      fill="none"
      strokeOpacity={0}
      strokeWidth={interactionWidth}
    />
  </>
))
