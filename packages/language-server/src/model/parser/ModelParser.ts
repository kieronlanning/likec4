import type * as c4 from '@likec4/core'
import { isNonEmptyArray, nonexhaustive, nonNullable } from '@likec4/core'
import { filter, first, isEmpty, isNonNullish, isTruthy, map, mapToObj, pipe } from 'remeda'
import {
  type ParsedAstElement,
  type ParsedAstExtendElement,
  type ParsedAstRelation,
  ast,
  resolveRelationPoints,
  streamModel,
  toElementStyle,
  toRelationshipStyleExcludeDefaults,
} from '../../ast'
import { logWarnError } from '../../logger'
import { stringHash } from '../../utils/stringHash'
import { type Base, removeIndent, toSingleLine } from './Base'

export type WithModel = ReturnType<typeof ModelParser>

export function ModelParser<TBase extends Base>(B: TBase) {
  return class ModelParser extends B {
    parseModel() {
      const doc = this.doc
      for (const el of streamModel(doc)) {
        try {
          if (ast.isElement(el)) {
            doc.c4Elements.push(this.parseElement(el))
            continue
          }
          if (ast.isRelation(el)) {
            if (this.isValid(el)) {
              doc.c4Relations.push(this.parseRelation(el))
            }
            continue
          }
          if (ast.isExtendElement(el)) {
            const parsed = this.parseExtendElement(el)
            if (parsed) {
              doc.c4ExtendElements.push(parsed)
            }
            continue
          }
          nonexhaustive(el)
        } catch (e) {
          logWarnError(e)
        }
      }
    }

    parseElement(astNode: ast.Element): ParsedAstElement {
      const isValid = this.isValid
      const id = this.resolveFqn(astNode)
      const kind = nonNullable(astNode.kind.ref, 'Element kind is not resolved').name as c4.ElementKind
      const tags = this.parseTags(astNode.body)
      const stylePropsAst = astNode.body?.props.find(ast.isElementStyleProperty)?.props
      const style = toElementStyle(stylePropsAst, isValid)
      const metadata = this.getMetadata(astNode.body?.props.find(ast.isMetadataProperty))
      const astPath = this.getAstNodePath(astNode)

      let [title, description, technology] = astNode.props ?? []

      const bodyProps = pipe(
        astNode.body?.props ?? [],
        filter(isValid),
        filter(ast.isElementStringProperty),
        mapToObj(p => [p.key, p.value || undefined]),
      )

      title = removeIndent(title ?? bodyProps.title)
      description = removeIndent(bodyProps.description ?? description)
      technology = toSingleLine(bodyProps.technology ?? technology)

      const links = this.parseLinks(astNode.body)

      // Property has higher priority than from style
      const iconProp = astNode.body?.props.find(ast.isIconProperty)
      if (iconProp && isValid(iconProp)) {
        const value = iconProp.libicon?.ref?.name ?? iconProp.value
        if (isTruthy(value)) {
          style.icon = value as c4.IconUrl
        }
      }

      return {
        id,
        kind,
        astPath,
        title: title ?? astNode.name,
        ...(metadata && { metadata }),
        ...(tags && { tags }),
        ...(links && isNonEmptyArray(links) && { links }),
        ...(isTruthy(technology) && { technology }),
        ...(isTruthy(description) && { description }),
        style,
      }
    }

    parseExtendElement(astNode: ast.ExtendElement): ParsedAstExtendElement | null {
      const isValid = this.isValid
      const id = this.resolveFqn(astNode)
      const tags = this.parseTags(astNode.body)
      const metadata = this.getMetadata(astNode.body?.props.find(ast.isMetadataProperty))
      const astPath = this.getAstNodePath(astNode)
      const links = this.parseLinks(astNode.body) ?? []

      if (!tags && isEmpty(metadata ?? {}) && isEmpty(links)) {
        return null
      }

      return {
        id,
        astPath,
        ...(metadata && { metadata }),
        ...(tags && { tags }),
        ...(links && isNonEmptyArray(links) && { links }),
      }
    }

    parseRelation(astNode: ast.Relation): ParsedAstRelation {
      const isValid = this.isValid
      const coupling = resolveRelationPoints(astNode)
      const target = this.resolveFqn(coupling.target)
      const source = this.resolveFqn(coupling.source)
      const tags = this.parseTags(astNode) ?? this.parseTags(astNode.body)
      const links = this.parseLinks(astNode.body)
      const kind = astNode.kind?.ref?.name as (c4.RelationshipKind | undefined)
      const metadata = this.getMetadata(astNode.body?.props.find(ast.isMetadataProperty))
      const astPath = this.getAstNodePath(astNode)

      const bodyProps = mapToObj(
        astNode.body?.props.filter(ast.isRelationStringProperty).filter(p => isNonNullish(p.value)) ?? [],
        p => [p.key, p.value],
      )

      const navigateTo = pipe(
        astNode.body?.props ?? [],
        filter(ast.isRelationNavigateToProperty),
        map(p => p.value.view.ref?.name),
        filter(isTruthy),
        first(),
      )

      const title = removeIndent(astNode.title ?? bodyProps.title) ?? ''
      const description = removeIndent(bodyProps.description)
      const technology = toSingleLine(astNode.technology) ?? removeIndent(bodyProps.technology)

      const styleProp = astNode.body?.props.find(ast.isRelationStyleProperty)
      const id = stringHash(
        astPath,
        source,
        target,
      ) as c4.RelationId
      return {
        id,
        astPath,
        source,
        target,
        title,
        ...(metadata && { metadata }),
        ...(isTruthy(technology) && { technology }),
        ...(isTruthy(description) && { description }),
        ...(kind && { kind }),
        ...(tags && { tags }),
        ...(isNonEmptyArray(links) && { links }),
        ...toRelationshipStyleExcludeDefaults(styleProp?.props, isValid),
        ...(navigateTo && { navigateTo: navigateTo as c4.ViewId }),
      }
    }
  }
}
