import { describe, expect, it } from 'vitest'
import { $step, compute } from './fixture'

describe('dynamic-view', () => {
  it('should include nodes and edges', () => {
    const { nodeIds, edgeIds, edges } = compute([
      $step('customer -> cloud.frontend.dashboard', 'open dashboard'),
      $step('cloud.frontend.dashboard -> cloud.backend.graphql'),
      $step('cloud.frontend.dashboard <- cloud.backend.graphql', 'return data')
    ])
    expect(nodeIds).toEqual([
      'customer',
      'cloud.frontend.dashboard',
      'cloud.backend.graphql'
    ])
    expect(edgeIds).toEqual([
      'step-001',
      'step-002',
      'step-003'
    ])
    expect(edges).toMatchObject([
      {
        id: 'step-001',
        source: 'customer',
        target: 'cloud.frontend.dashboard',
        isConstraint: true,
        label: 'open dashboard'
      },
      {
        id: 'step-002',
        source: 'cloud.frontend.dashboard',
        target: 'cloud.backend.graphql',
        isConstraint: true,
        label: null
      },
      {
        id: 'step-003',
        source: 'cloud.backend.graphql',
        target: 'cloud.frontend.dashboard',
        isConstraint: false,
        label: 'return data'
      }
    ])
  })

  it('should build compounds', () => {
    const { nodeIds, edgeIds, nodes, edges } = compute([
      $step('customer -> cloud.frontend.dashboard'),
      $step('cloud.frontend.dashboard -> cloud.backend.graphql'),
      $step('cloud.backend -> amazon'),
      $step('cloud.backend <- amazon'),
      $step('cloud.frontend <- cloud.backend')
    ])
    expect(nodeIds).toEqual([
      'customer',
      'cloud.frontend.dashboard',
      'cloud.backend.graphql',
      'cloud.backend',
      'amazon',
      'cloud.frontend'
    ])
    expect(edgeIds).toEqual([
      'step-001',
      'step-002',
      'step-003',
      'step-004',
      'step-005'
    ])

    expect(nodes).toMatchObject([
      {
        id: 'customer',
        parent: null,
        outEdges: ['step-001'],
        inEdges: []
      },
      {
        id: 'cloud.frontend.dashboard',
        parent: 'cloud.frontend',
        inEdges: ['step-001'],
        outEdges: ['step-002']
      },
      {
        id: 'cloud.backend.graphql',
        parent: 'cloud.backend',
        inEdges: ['step-002'],
        outEdges: []
      },
      {
        id: 'cloud.backend',
        parent: null,
        inEdges: [
          'step-002',
          'step-004'
        ],
        outEdges: [
          'step-003',
          'step-005'
        ]
      },
      {
        id: 'amazon',
        parent: null,
        inEdges: ['step-003'],
        outEdges: ['step-004']
      },
      {
        id: 'cloud.frontend',
        parent: null,
        outEdges: ['step-002'],
        inEdges: [
          'step-001',
          'step-005'
        ]
      }
    ])
    const [step1, step2, step3, step4, step5] = edges
    expect(step1).toMatchObject({
      id: 'step-001',
      source: 'customer',
      target: 'cloud.frontend.dashboard',
      label: null,
      isConstraint: true
    })
    expect(step2).toMatchObject({
      id: 'step-002',
      source: 'cloud.frontend.dashboard',
      target: 'cloud.backend.graphql',
      label: null,
      isConstraint: true
    })
    expect(step3).toMatchObject({
      id: 'step-003',
      source: 'cloud.backend',
      target: 'amazon',
      label: null,
      isConstraint: true
    })
    expect(step4).toMatchObject({
      id: 'step-004',
      source: 'amazon',
      target: 'cloud.backend',
      label: null,
      isConstraint: false
    })
    expect(step5).toMatchObject({
      id: 'step-005',
      source: 'cloud.backend',
      target: 'cloud.frontend',
      label: null,
      isConstraint: false
    })

    // expect(edges).toMatchObject([
    //   {
    //     id: 'step-001',
    //     source: 'customer',
    //     target: 'cloud.frontend.dashboard',
    //     isConstraint: true,
    //     label: 'open dashboard'
    //   },
    //   {
    //     id: 'step-002',
    //     source: 'cloud.frontend.dashboard',
    //     target: 'cloud.backend.graphql',
    //     isConstraint: true,
    //     label: null
    //   },
    //   {
    //     id: 'step-003',
    //     source: 'cloud.backend.graphql',
    //     target: 'cloud.frontend.dashboard',
    //     isConstraint: false,
    //     label: 'return data'
    //   }
    // ])
  })
})
