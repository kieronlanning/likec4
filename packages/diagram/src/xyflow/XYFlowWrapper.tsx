import { useMantineColorScheme } from '@mantine/core'
import { ReactFlow } from '@xyflow/react'
import { deepEqual } from 'fast-equals'
import {
  type CSSProperties,
  memo,
  type MouseEvent as ReactMouseEvent,
  type PropsWithChildren,
  useCallback,
  useRef
} from 'react'
import type { Simplify } from 'type-fest'
import type { LikeC4DiagramProperties } from '../LikeC4Diagram.props'
import { useDiagramStateTracked } from '../state/DiagramState'
import { MinZoom } from './const'
import { RelationshipEdge } from './edges/RelationshipEdge'
import { useLayoutConstraints } from './hooks/use-layout-сonstraints'
import { CompoundNode } from './nodes/compound'
import { ElementNode } from './nodes/element'
import { XYFlowEdge, type XYFlowInstance, XYFlowNode } from './types'
import { useXYFlowEvents } from './XYFlowEvents'

const nodeTypes = {
  element: ElementNode,
  compound: CompoundNode
}
const edgeTypes = {
  relationship: RelationshipEdge
}

type OnlyExpectedProps = Required<
  Omit<
    LikeC4DiagramProperties,
    | 'view'
    | 'disableHovercards'
    | 'controls'
    | 'background'
    | 'initialWidth'
    | 'initialHeight'
    | 'keepAspectRatio'
  >
>

type XYFlowWrapperProps = Simplify<
  PropsWithChildren<
    OnlyExpectedProps & {
      defaultNodes: XYFlowNode[]
      defaultEdges: XYFlowEdge[]
      style?: CSSProperties | undefined
    }
  >
>

function XYFlowWrapper({
  className,
  children,
  defaultNodes,
  defaultEdges,
  fitView = true,
  colorScheme: colorModeProp,
  readonly = false,
  pannable = true,
  zoomable = true,
  nodesSelectable = !readonly,
  nodesDraggable = !readonly,
  fitViewPadding = 0,
  style
}: XYFlowWrapperProps) {
  const xyflowRef = useRef<XYFlowInstance>()
  const [editor, updateState] = useDiagramStateTracked()
  const layoutConstraints = useLayoutConstraints(xyflowRef)

  const handlers = useXYFlowEvents()

  const { colorScheme } = useMantineColorScheme()
  let colorMode = colorModeProp ?? (colorScheme !== 'auto' ? colorScheme : undefined)

  return (
    // @ts-expect-error
    <ReactFlow
      className={className}
      style={style}
      {...colorMode && { colorMode }}
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes as any}
      zoomOnPinch={zoomable}
      zoomOnScroll={!pannable && zoomable}
      {...(!zoomable && {
        zoomActivationKeyCode: null
      })}
      maxZoom={zoomable ? 1.9 : 1}
      minZoom={zoomable ? MinZoom : 1}
      fitView={fitView}
      fitViewOptions={{
        minZoom: MinZoom,
        maxZoom: 1,
        padding: fitViewPadding
      }}
      defaultMarkerColor="var(--xy-edge-stroke)"
      noDragClassName="nodrag"
      noPanClassName="nopan"
      panOnScroll={pannable}
      panOnDrag={pannable}
      elementsSelectable={nodesSelectable}
      {...(!nodesSelectable && {
        selectionKeyCode: null
      })}
      nodesDraggable={nodesDraggable}
      {...(nodesDraggable && layoutConstraints)}
      zoomOnDoubleClick={false}
      elevateNodesOnSelect={false} // or edges are not visible after select
      selectNodesOnDrag={false} // or weird camera movement
      onInit={(instance) => {
        xyflowRef.current = (instance as unknown) as XYFlowInstance
        updateState({ viewportInitialized: true })
      }}
      {
        // onMoveEnd={(event, viewport) => {
        //   console.debug('onMoveEnd', { event, viewport })
        // }}
        // onViewportChange={(viewport) => {
        //   console.debug('onViewportChange', { event, viewport })
        // }}
        ...(editor.isNodeInteractive && {
          onEdgeMouseEnter: (_event, edge) => {
            updateState({ hoveredEdgeId: edge.id })
          },
          onEdgeMouseLeave: () => {
            updateState({ hoveredEdgeId: null })
          },
          onNodeMouseEnter: (_event, node) => {
            updateState({ hoveredNodeId: node.id })
          },
          onNodeMouseLeave: () => {
            updateState({ hoveredNodeId: null })
          }
        })
      }
      {...(editor.hasOnContextMenu && {
        onNodeContextMenu: handlers.onNodeContextMenu,
        onPaneContextMenu: handlers.onPaneContextMenu,
        onEdgeContextMenu: handlers.onEdgeContextMenu
      })}
      {...(editor.hasOnCanvasClick && {
        onPaneClick: handlers.onPanelClick
      })}
      {...(editor.hasOnNodeClick && {
        onNodeClick: handlers.onNodeClick
      })}
      {...(editor.hasOnEdgeClick && {
        onEdgeClick: handlers.onEdgeClick
      })}>
      {children}
    </ReactFlow>
  )
}

const isEquals = (
  { children: _childrenA, ...a }: XYFlowWrapperProps,
  { children: _childrenB, ...b }: XYFlowWrapperProps
) => deepEqual(a, b)
export const XYFlow = memo(XYFlowWrapper, isEquals) as typeof XYFlowWrapper
