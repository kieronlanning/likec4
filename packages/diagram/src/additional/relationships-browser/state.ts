import { type BBox, type DiagramView, type Fqn, invariant } from '@likec4/core'
import {
  type ReactFlowInstance,
} from '@xyflow/react'
import { prop } from 'remeda'
import {
  type ActorRefFromLogic,
  type SnapshotFrom,
  assign,
  raise,
  setup,
} from 'xstate'
import { MaxZoom, MinZoom } from '../../base/const'
import type { RelationshipsBrowserTypes } from './_types'

type XYFLowInstance = ReactFlowInstance<RelationshipsBrowserTypes.Node, RelationshipsBrowserTypes.Edge>

export type Input = {
  subject: Fqn
  scope?: DiagramView | null
  // parentRef?: AnyActorRef| null
}

export type Context = Readonly<
  Input & {
    // parentRef: AnyActorRef | null
    xyflow: XYFLowInstance | null
    initialized: boolean
  }
>

export type Events =
  | { type: 'xyflow.init'; instance: XYFLowInstance }
  | { type: 'xyflow.nodeClick'; node: RelationshipsBrowserTypes.Node }
  | { type: 'xyflow.edgeClick'; edge: RelationshipsBrowserTypes.Edge }
  | { type: 'xyflow.paneClick' }
  | { type: 'fitDiagram'; duration?: number; bounds?: BBox }
  | { type: 'navigate.to'; subject: Fqn }
  | { type: 'close' }

export const relationshipsBrowserLogic = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    events: {} as Events,
  },
  actions: {
    'xyflow:fitDiagram': ({ context }, params?: { duration?: number; bounds?: BBox }) => {
      const {
        duration = 450,
        bounds,
      } = params ?? {}
      const { xyflow } = context
      invariant(xyflow, 'xyflow is not initialized')
      if (bounds) {
        xyflow.fitBounds(bounds, duration > 0 ? { duration } : undefined)
      } else {
        const maxZoom = Math.max(xyflow.getZoom(), 1)
        xyflow.fitView({
          minZoom: MinZoom,
          maxZoom,
          padding: 0.1,
          ...(duration > 0 && { duration }),
        })
      }
    },
  },
}).createMachine({
  initial: 'opening',
  context: ({ input }) => ({
    ...input,
    initialized: false,
    xyflow: null,
  }),
  states: {
    'opening': {
      on: {
        'xyflow.init': {
          actions: [
            assign({
              initialized: true,
              xyflow: ({ event }) => event.instance,
            }),
            { type: 'xyflow:fitDiagram', params: { duration: 0 } },
          ],
          target: 'active',
        },
      },
    },
    'active': {
      on: {
        'xyflow.nodeClick': {
          actions: [
            assign({
              subject: ({ event }) => event.node.data.fqn,
            }),
            raise({ type: 'fitDiagram' }, { delay: 50 }),
          ],
        },
        'navigate.to': {
          actions: [
            assign({
              subject: ({ event }) => event.subject,
            }),
            raise({ type: 'fitDiagram' }, { delay: 50 }),
          ],
        },
      },
    },
    'closed': {
      type: 'final',
    },
  },
  on: {
    'fitDiagram': {
      actions: {
        type: 'xyflow:fitDiagram',
        params: prop('event'),
      },
    },
    'close': {
      target: '.closed',
    },
  },
  exit: assign({
    // parentRef: null,
    xyflow: null,
  }),
})

export type RelationshipsBrowserLogic = typeof relationshipsBrowserLogic
export type RelationshipsBrowserActorRef = ActorRefFromLogic<typeof relationshipsBrowserLogic>
export type RelationshipsBrowserSnapshot = SnapshotFrom<RelationshipsBrowserActorRef>
