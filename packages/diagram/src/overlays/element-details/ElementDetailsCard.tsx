import {
  type DiagramView,
  type Element,
  type Fqn,
  type LikeC4View,
  type Link,
  ComputedNode,
  ComputedView,
  isDeploymentView,
  isScopedElementView,
} from '@likec4/core'
import {
  type TextProps,
  ActionIcon,
  ActionIconGroup,
  Anchor,
  Badge,
  Box,
  Card,
  CloseButton,
  Code,
  CopyButton,
  Divider as MantineDivider,
  Flex,
  FocusTrap,
  FocusTrapInitialFocus,
  Group,
  RemoveScroll,
  ScrollArea,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  ThemeIcon,
  Tooltip as MantineTooltip,
  UnstyledButton,
} from '@mantine/core'
import { useDebouncedCallback, useSessionStorage, useViewportSize } from '@mantine/hooks'
import { IconCheck, IconCopy, IconExternalLink, IconStack2, IconZoomScan } from '@tabler/icons-react'
import clsx from 'clsx'
import { type PanInfo, m, useDragControls, useMotionValue } from 'framer-motion'
import { type PropsWithChildren, memo, useCallback, useLayoutEffect, useRef } from 'react'
import { clamp, isNullish, map, only, partition, pipe } from 'remeda'
import { IconRenderer } from '../../context'
import { useUpdateEffect } from '../../hooks'
import { useDiagramContext } from '../../hooks2'
import { useDiagram } from '../../hooks2/useDiagram'
import type { ElementIconRenderer, OnNavigateTo } from '../../LikeC4Diagram.props'
import { useLikeC4CurrentViewModel } from '../../likec4model'
import * as css from './ElementDetailsCard.css'
import { TabPanelDeployments } from './TabPanelDeployments'
import { TabPanelStructure } from './TabPanelStructure'

const Divider = MantineDivider.withProps({
  mb: 8,
  labelPosition: 'left',
  variant: 'dashed',
})
const Tooltip = MantineTooltip.withProps({
  color: 'dark',
  fz: 'xs',
  openDelay: 400,
  closeDelay: 150,
  label: '',
  children: null,
  offset: 4,
})

const SmallLabel = Text.withProps({
  component: 'div',
  fz: 11,
  fw: 500,
  c: 'dimmed',
  lh: 1,
})

const PropertyLabel = Text.withProps({
  component: 'div',
  fz: 'xs',
  c: 'dimmed',
  className: css.propertyLabel,
})

type ElementDetailsCardProps = {
  fqn: Fqn
}

const MIN_PADDING = 24

const TABS = ['Properties', 'Relationships', 'Views', 'Structure', 'Deployments'] as const
type TabName = typeof TABS[number]

export const ElementDetailsCard = memo(({ fqn }: ElementDetailsCardProps) => {
  const {
    fromNode,
    rectFromNode,
  } = useDiagramContext(s => ({
    fromNode: s.activeElementDetails?.fromNode ?? null,
    rectFromNode: s.activeElementDetails?.nodeRectScreen ?? null,
  }))
  const windowSize = useViewportSize()
  const windowWidth = windowSize.width || window.innerWidth || 1200,
    windowHeight = windowSize.height || window.innerHeight || 800

  const [activeTab, setActiveTab] = useSessionStorage<TabName>({
    key: `likec4:element-details:active-tab`,
    defaultValue: 'Properties',
  })
  const diagram = useDiagram()
  const viewModel = useLikeC4CurrentViewModel()
  // const currentView = diagram.currentView()

  // const diagramNode = currentView.nodes.find(n => n.id === fqn)
  // invariant(diagramNode, `DiagramNode with fqn ${fqn} not found`)
  const nodeModel = fromNode ? viewModel.findNode(fromNode) : viewModel.findNodeWithElement(fqn)
  // invariant(nodeModel && nodeModel.hasElement(), `NodeModel with fqn ${fqn} not found`)
  const elementModel = viewModel.$model.element(fqn)
  const viewId = viewModel.id

  // const incoming = elementModel.incoming().map(r => r.id).toArray()
  // const outgoing = elementModel.outgoing().map(r => r.id).toArray()

  // const incomingInView = unique(nodeModel.incoming().flatMap(e => e.$edge.relations).toArray())
  // const outgoingInView = unique(nodeModel.outgoing().flatMap(e => e.$edge.relations).toArray())

  // const notIncludedRelations = [
  //   ...incoming,
  //   ...outgoing
  // ].filter(r => !incomingInView.includes(r) && !outgoingInView.includes(r)).length

  const [viewsOf, otherViews] = pipe(
    [...elementModel.views()],
    map(v => v.$view),
    partition(view => {
      const v = view as LikeC4View
      return isScopedElementView(v) && v.viewOf === fqn
    }),
  )

  let defaultView = nodeModel?.navigateTo?.$view ?? elementModel.defaultView?.$view ?? null
  if (defaultView?.id === diagram.currentView().id) {
    defaultView = null
  }

  const defaultLink = only(elementModel.links)

  // const onNavigateToCb = useCallback((toView: ViewId, e?: React.MouseEvent): void => {
  //   e?.stopPropagation()
  //   const { onNavigateTo } = diagramApi.getState()
  //   if (!onNavigateTo) {
  //     return
  //   }
  //   overlay.close(() => {
  //     diagramApi.setState({
  //       lastOnNavigate: {
  //         fromView: viewModel.id,
  //         toView,
  //         fromNode: fqn,
  //       },
  //     })
  //     onNavigateTo(toView)
  //   })
  // }, [fqn, viewModel.id])
  const controls = useDragControls()

  const isCompound = (nodeModel?.$node.children?.length ?? 0) > 0
  const _width = Math.min(700, windowWidth - MIN_PADDING * 2)
  const _height = Math.min(650, windowHeight - MIN_PADDING * 2)

  const fromPositon = rectFromNode
    ? {
      x: rectFromNode.x + (isCompound ? (rectFromNode.width - _width / 2) : rectFromNode.width / 2),
      y: rectFromNode.y + (isCompound ? 0 : rectFromNode.height / 2),
    }
    : {
      x: windowWidth / 2,
      y: windowHeight / 2,
    }

  const fromScale = rectFromNode ? Math.min(rectFromNode.width / _width, rectFromNode.height / _height, 0.9) : 1

  const left = Math.round(
    clamp(fromPositon.x - _width / 2, {
      min: MIN_PADDING,
      max: windowWidth - _width - MIN_PADDING,
    }),
  )
  const top = Math.round(
    clamp(fromPositon.y - (isCompound ? 0 : 60), {
      min: MIN_PADDING,
      max: windowHeight - _height - MIN_PADDING,
    }),
  )

  const originX = clamp((fromPositon.x - left) / _width, {
    min: 0.1,
    max: 0.9,
  })
  const originY = clamp((fromPositon.y - top) / _height, {
    min: 0.1,
    max: 0.9,
  })

  const width = useMotionValue(_width)
  const height = useMotionValue(_height)

  useUpdateEffect(() => {
    width.set(_width)
    height.set(_height)
  }, [_width, _height])

  const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    width.set(Math.max(width.get() + info.delta.x, 320))
    height.set(Math.max(height.get() + info.delta.y, 300))
  }, [])

  const ref = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    ref.current?.showModal()
  }, [])

  const diagramApi = useDiagram()
  const close = useDebouncedCallback(
    () => {
      diagramApi.closeOverlay()
    },
    50,
  )

  const notation = nodeModel?.$node.notation ?? null

  const elementIcon = IconRenderer({
    element: {
      id: fqn,
      title: elementModel.title,
      icon: nodeModel?.icon ?? elementModel.icon,
    },
    className: css.elementIcon,
  })

  return (
    <m.dialog
      ref={ref}
      className={css.dialog}
      layoutRoot
      initial={{
        '--backdrop-blur': '0px',
        '--backdrop-opacity': '0%',
      }}
      animate={{
        '--backdrop-blur': '1px',
        '--backdrop-opacity': '50%',
      }}
      exit={{
        '--backdrop-blur': '0px',
        '--backdrop-opacity': '0%',
        transition: {
          duration: 0.1,
        },
      }}
      onClick={e => {
        if ((e.target as any)?.nodeName?.toUpperCase() === 'DIALOG') {
          e.stopPropagation()
          close()
        }
      }}
      onClose={e => {
        e.stopPropagation()
        close()
      }}
    >
      <RemoveScroll forwardProps>
        <Card
          drag
          dragElastic={0}
          dragMomentum={false}
          dragListener={false}
          dragControls={controls}
          withBorder
          shadow="md"
          component={m.div}
          className={css.card}
          layoutId={fqn}
          initial={{
            top,
            left,
            width: _width,
            height: _height,
            opacity: 0,
            originX,
            originY,
            scale: Math.max(fromScale, 0.7),
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            translateY: -10,
            transition: {
              duration: 0.1,
            },
          }}
          style={{
            // `style` prop in Mantine doesn't accept motion values
            width: width as any,
            height: height as any,
          }}
          data-likec4-color={nodeModel?.color ?? elementModel.color}>
          <FocusTrap>
            <FocusTrapInitialFocus />
            <Box
              className={css.cardHeader}
              onPointerDown={e => controls.start(e)}>
              <Group align="start" justify="space-between" gap={'sm'} mb={'sm'} wrap="nowrap">
                <Group align="start" gap={'sm'} style={{ cursor: 'default' }} wrap="nowrap">
                  {elementIcon}
                  <Box>
                    <Text
                      component={m.div}
                      layout="position"
                      layoutId={`${viewId}:element:title:${fqn}`}
                      className={css.title}>
                      {elementModel.title}
                    </Text>
                    {notation && (
                      <Text component="div" c={'dimmed'} fz={'sm'} fw={500} lh={1.3} lineClamp={1}>
                        {notation}
                      </Text>
                    )}
                  </Box>
                </Group>
                <CloseButton
                  size={'lg'}
                  onClick={e => {
                    e.stopPropagation()
                    close()
                  }}
                />
              </Group>
              <Group align="baseline" gap={'sm'} wrap="nowrap">
                <Box>
                  <SmallLabel>kind</SmallLabel>
                  <Badge radius={'sm'} size="sm" fw={600} color="gray">{elementModel.kind}</Badge>
                </Box>
                <Box flex={1}>
                  <SmallLabel>tags</SmallLabel>
                  <Flex gap={4} flex={1} mt={6}>
                    {elementModel.tags.map((tag) => (
                      <Badge key={tag} radius={'sm'} size="sm" fw={600} variant="gradient">#{tag}</Badge>
                    ))}
                    {elementModel.tags.length === 0 && <Badge radius={'sm'} size="sm" fw={600} color="gray">—</Badge>}
                  </Flex>
                </Box>
                <ActionIconGroup
                  style={{
                    alignSelf: 'flex-end',
                  }}>
                  {defaultLink && (
                    <ActionIcon
                      component="a"
                      href={defaultLink.url}
                      target="_blank"
                      size="lg"
                      variant="default"
                      radius="sm"
                    >
                      <IconExternalLink stroke={1.6} style={{ width: '65%' }} />
                    </ActionIcon>
                  )}
                  {
                    /* {onOpenSource && (
                    <Tooltip label="Open source">
                      <ActionIcon
                        size="lg"
                        variant="default"
                        radius="sm"
                        onClick={e => {
                          e.stopPropagation()
                          diagramApi.getState().onOpenSource?.({
                            element: elementModel.id,
                          })
                        }}
                      >
                        <IconFileSymlink stroke={1.8} style={{ width: '62%' }} />
                      </ActionIcon>
                    </Tooltip>
                  )} */
                  }
                  {defaultView && (
                    <Tooltip label="Open default view">
                      <ActionIcon
                        size="lg"
                        variant="default"
                        radius="sm"
                        onClick={e => {
                          e.stopPropagation()
                          diagram.navigateTo(defaultView.id, fromNode ?? undefined)
                        }}>
                        <IconZoomScan style={{ width: '70%' }} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </ActionIconGroup>
              </Group>
            </Box>

            <Tabs
              value={activeTab}
              onChange={v => setActiveTab(v as any)}
              variant="none"
              classNames={{
                root: css.tabsRoot,
                list: css.tabsList,
                tab: css.tabsTab,
                panel: css.tabsPanel,
              }}>
              <TabsList>
                {TABS.map(tab => (
                  <TabsTab key={tab} value={tab}>
                    {tab}
                  </TabsTab>
                ))}
              </TabsList>

              <TabsPanel value="Properties">
                <ScrollArea scrollbars="y" type="auto">
                  <Box className={css.propertiesGrid} pt={'xs'}>
                    <ElementProperty title="description" emptyValue="no description">
                      {elementModel.description}
                    </ElementProperty>
                    {elementModel.technology && (
                      <ElementProperty title="technology">
                        {elementModel.technology}
                      </ElementProperty>
                    )}
                    {elementModel.links.length > 0 && (
                      <>
                        <PropertyLabel>links</PropertyLabel>
                        <Stack gap={'xs'} align="flex-start">
                          {elementModel.links.map((link, i) => <ElementLink key={i} value={link} />)}
                        </Stack>
                      </>
                    )}
                    {elementModel.$element.metadata && <ElementMetata value={elementModel.$element.metadata} />}
                  </Box>
                </ScrollArea>
              </TabsPanel>

              {
                /* <TabsPanel value="Relationships">
                {activeTab === 'Relationships' && (
                  <TabPanelRelationships
                    element={elementModel}
                    node={nodeModel}
                    currentView={currentView} />
                )}
              </TabsPanel> */
              }

              <TabsPanel value="Views">
                <ScrollArea scrollbars="y" type="auto">
                  <Stack gap={'lg'}>
                    {viewsOf.length > 0 && (
                      <Box>
                        <Divider label="views of the element (scoped)" />
                        <Stack gap={'sm'}>
                          {viewsOf.map((view) => (
                            <ViewButton
                              key={view.id}
                              view={view}
                              onNavigateTo={to => diagram.navigateTo(to, fromNode ?? undefined)}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    {otherViews.length > 0 && (
                      <Box>
                        <Divider label="views including this element" />
                        <Stack gap={'sm'}>
                          {otherViews.map((view) => (
                            <ViewButton
                              key={view.id}
                              view={view}
                              onNavigateTo={to => diagram.navigateTo(to, fromNode ?? undefined)}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </ScrollArea>
              </TabsPanel>

              <TabsPanel value="Structure">
                <ScrollArea scrollbars="y" type="auto">
                  <TabPanelStructure element={elementModel} />
                </ScrollArea>
              </TabsPanel>

              <TabsPanel value="Deployments">
                <ScrollArea scrollbars="y" type="auto">
                  <TabPanelDeployments elementFqn={elementModel.id} />
                </ScrollArea>
              </TabsPanel>
            </Tabs>
            <m.div
              className={css.resizeHandle}
              drag
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            />
          </FocusTrap>
        </Card>
      </RemoveScroll>
    </m.dialog>
  )
})
ElementDetailsCard.displayName = 'ElementDetailsCard'

const ElementIcon = (
  { element, viewId, renderIcon: RenderIcon }: {
    element: ComputedNode
    viewId: string
    renderIcon: ElementIconRenderer | null
  },
) => {
  if (!element.icon || element.icon === 'none') {
    return null
  }
  let icon = null as React.ReactNode
  if (element.icon.startsWith('http://') || element.icon.startsWith('https://')) {
    icon = <img src={element.icon} alt={element.title} />
  } else if (RenderIcon) {
    icon = <RenderIcon node={element} />
  }

  if (!icon) {
    return null
  }
  return (
    <m.div
      // layout="position"
      layoutId={`${viewId}:element:icon:${element.id}`}
      className={clsx(
        css.elementIcon,
        'likec4-element-icon',
      )}
      data-likec4-icon={element.icon}
    >
      {icon}
    </m.div>
  )
}

const ViewButton = ({
  view,
  onNavigateTo,
}: {
  view: ComputedView | DiagramView
  onNavigateTo: OnNavigateTo
}) => {
  return (
    <UnstyledButton className={css.viewButton} onClick={e => onNavigateTo(view.id, e)}>
      <Group gap={6} align="start" wrap="nowrap">
        <ThemeIcon size={'sm'} variant="transparent">
          {isDeploymentView(view)
            ? <IconStack2 stroke={1.8} />
            : <IconZoomScan stroke={1.8} />}
        </ThemeIcon>
        <Box>
          <Text component="div" className={css.viewButtonTitle} lineClamp={1}>
            {view.title || 'untitled'}
          </Text>
          {view.description && (
            <Text component="div" mt={2} fz={'xs'} c={'dimmed'} lh={1.4} lineClamp={1}>
              {view.description}
            </Text>
          )}
        </Box>
      </Group>
    </UnstyledButton>
  )
}

function ElementProperty({
  title,
  emptyValue = `undefined`,
  children,
  style,
  ...props
}: PropsWithChildren<
  Omit<TextProps, 'title'> & {
    title: string
    emptyValue?: string
  }
>) {
  return (
    <>
      <PropertyLabel>{title}</PropertyLabel>
      <Text
        component="div"
        {...(isNullish(children) && { c: 'dimmed' })}
        fz={'md'}
        style={{
          whiteSpace: 'preserve-breaks',
          ...style,
        }}
        {...props}
      >
        {children || emptyValue}
      </Text>
    </>
  )
}

function ElementLink({
  value,
}: {
  value: Link
}) {
  const url = new URL(value.url, window.location.href).toString()
  return (
    <CopyButton value={url}>
      {({ copied, copy }) => (
        <Anchor href={url} target="_blank" underline="never" className={css.elementLink}>
          <Group gap={4} align="center" wrap="nowrap">
            <ActionIcon
              tabIndex={-1}
              size={24}
              variant={copied ? 'light' : 'subtle'}
              color={copied ? 'teal' : 'gray'}
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                copy()
              }}
            >
              {copied ? <IconCheck /> : <IconCopy style={{ width: '65%', opacity: 0.8 }} />}
            </ActionIcon>
            <Box flex={1}>
              <Text fz={'sm'} truncate lh={1.3} fw={value.title ? 500 : 400}>
                {value.title || url}
              </Text>
              {value.title && (
                <Text component="div" fz={10} c={'dimmed'} lh={1.2} truncate>
                  {url}
                </Text>
              )}
            </Box>
          </Group>
        </Anchor>
      )}
    </CopyButton>
  )
  // <Anchor href={value.url} fz={'sm'}>
  //   {value.title || url}
  // </Anchor><Button variant='default' size='sm'>
  //     {value.title || value.url}
  //   </Button>
  //  </Box>
  // )
}

function ElementMetata({
  value,
}: {
  value: NonNullable<Element['metadata']>
}) {
  return (
    <>
      <PropertyLabel>metadata</PropertyLabel>
      <Box>
        <Code block>
          {JSON.stringify(value, null, 2)}
        </Code>
      </Box>
    </>
  )
}
