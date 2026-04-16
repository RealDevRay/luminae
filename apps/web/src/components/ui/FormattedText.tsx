'use client'

import React from 'react'

interface FormattedTextProps {
  text: string
  className?: string
  as?: 'p' | 'span' | 'div'
}

/**
 * Renders AI-generated text with basic markdown formatting.
 * Handles: **bold**, *italic*, newlines, and stray markers.
 */
export function FormattedText({ text, className = '', as: Tag = 'p' }: FormattedTextProps) {
  if (!text || typeof text !== 'string') return null

  const rendered = parseMarkdownInline(text)

  return <Tag className={`break-words ${className}`.trim()}>{rendered}</Tag>
}

/**
 * Renders a list of AI-generated strings, each as a formatted <li>.
 */
export function FormattedList({
  items,
  className = '',
  ordered = false,
}: {
  items: string[]
  className?: string
  ordered?: boolean
}) {
  if (!items || items.length === 0) return null

  const ListTag = ordered ? 'ol' : 'ul'
  const listStyle = ordered ? 'list-decimal' : 'list-disc'

  return (
    <ListTag className={`${listStyle} list-inside space-y-1 ${className}`}>
      {items.map((item, i) => (
        <li key={i}>
          <FormattedText text={item} as="span" />
        </li>
      ))}
    </ListTag>
  )
}

// ---------------------------------------------------------------------------
// Inline markdown parser – converts **bold**, *italic*, bullet points, and \n to React nodes
// ---------------------------------------------------------------------------

function parseMarkdownInline(text: string): React.ReactNode[] {
  const lines = text.split(/\n/)
  const nodes: React.ReactNode[] = []
  let bulletBuffer: React.ReactNode[] = []
  let keyCounter = 0

  const flushBullets = () => {
    if (bulletBuffer.length > 0) {
      nodes.push(
        React.createElement('ul', { key: `ul-${keyCounter++}`, className: 'list-disc list-inside space-y-1 my-2' },
          ...bulletBuffer
        )
      )
      bulletBuffer = []
    }
  }

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim()
    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/)

    if (bulletMatch) {
      const content = parseInlineFormatting(bulletMatch[1], lineIdx)
      bulletBuffer.push(
        React.createElement('li', { key: `li-${keyCounter++}` }, ...content)
      )
    } else {
      flushBullets()
      if (trimmed === '') {
        if (nodes.length > 0) {
          nodes.push(React.createElement('br', { key: `br-${keyCounter++}` }))
        }
      } else {
        if (nodes.length > 0 && bulletBuffer.length === 0) {
          nodes.push(React.createElement('br', { key: `br-${keyCounter++}` }))
        }
        const lineNodes = parseInlineFormatting(trimmed, lineIdx)
        nodes.push(...lineNodes)
      }
    }
  })

  flushBullets()
  return nodes
}

function parseInlineFormatting(text: string, lineKey: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Regex: match **bold**, *italic*, or plain text segments
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|_(.+?)_)/g

  let lastIndex = 0
  let match: RegExpExecArray | null
  let keyIdx = 0

  while ((match = regex.exec(text)) !== null) {
    // Add preceding plain text
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // **bold**
      nodes.push(<strong key={`${lineKey}-b-${keyIdx++}`}>{match[2]}</strong>)
    } else if (match[3]) {
      // *italic*
      nodes.push(<em key={`${lineKey}-i-${keyIdx++}`}>{match[3]}</em>)
    } else if (match[4]) {
      // __bold__
      nodes.push(<strong key={`${lineKey}-ub-${keyIdx++}`}>{match[4]}</strong>)
    } else if (match[5]) {
      // _italic_
      nodes.push(<em key={`${lineKey}-ui-${keyIdx++}`}>{match[5]}</em>)
    }

    lastIndex = regex.lastIndex
  }

  // Add trailing plain text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

/**
 * Converts an ALL CAPS or messy category string to Title Case.
 * e.g. "DESIGN FLAWS" → "Design Flaws", "statistical_power" → "Statistical Power"
 */
export function toTitleCase(str: string): string {
  if (!str) return ''
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
