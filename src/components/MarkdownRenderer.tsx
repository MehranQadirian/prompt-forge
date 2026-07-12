import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants';

interface MarkdownRendererProps {
  content: string;
  style?: TextStyle;
}

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; text: string; url: string }
  | { type: 'placeholder'; value: string };

type Block =
  | { type: 'heading'; level: number; inlines: InlineToken[] }
  | { type: 'paragraph'; inlines: InlineToken[] }
  | { type: 'list-item'; inlines: InlineToken[]; ordered: boolean; number?: number }
  | { type: 'blockquote'; inlines: InlineToken[] }
  | { type: 'code-block'; language?: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'hr' };

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Combined regex for bold, italic, inline code, links, and placeholders
  const regex = /(\*\*(.+?)\*\*|__(.+?)__)|(\*(.+?)\*|_(.+?)_)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))|(\[([^\[\]]+)\])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.substring(lastIndex, match.index) });
    }

    if (match[1]) {
      // Bold **text** or __text__
      tokens.push({ type: 'bold', value: match[2] || match[3] });
    } else if (match[4]) {
      // Italic *text* or _text_
      tokens.push({ type: 'italic', value: match[5] || match[6] });
    } else if (match[7]) {
      // Inline code `text`
      tokens.push({ type: 'code', value: match[8] });
    } else if (match[9]) {
      // Link [text](url)
      tokens.push({ type: 'link', text: match[10], url: match[11] });
    } else if (match[12]) {
      // Placeholder [text]
      tokens.push({ type: 'placeholder', value: match[13] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.substring(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', value: text }];
}

function parseBlocks(content: string): Block[] {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code-block', language: lang || undefined, code: codeLines.join('\n') });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, inlines: parseInline(headingMatch[2]) });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Table (detect first | line)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (row: string) =>
          row.split('|').slice(1, -1).map((c) => c.trim());
        const headers = parseRow(tableLines[0]);
        // Skip separator row (---|---|---)
        const dataRows = tableLines.slice(2).map(parseRow);
        blocks.push({ type: 'table', headers, rows: dataRows });
      }
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('> ')) {
        quoteLines.push(lines[i].trimStart().slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', inlines: parseInline(quoteLines.join('\n')) });
      continue;
    }

    // Ordered list item
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (orderedMatch) {
      const num = parseInt(line.match(/^(\s*)(\d+)\./)?.[2] || '1', 10);
      blocks.push({ type: 'list-item', inlines: parseInline(orderedMatch[2]), ordered: true, number: num });
      i++;
      continue;
    }

    // Unordered list item
    const unorderedMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    if (unorderedMatch) {
      blocks.push({ type: 'list-item', inlines: parseInline(unorderedMatch[2]), ordered: false });
      i++;
      continue;
    }

    // Regular paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trimStart().startsWith('#') &&
      !lines[i].trimStart().startsWith('```') &&
      !lines[i].trimStart().startsWith('> ') &&
      !lines[i].trimStart().startsWith('|') &&
      !/^(\s*)[-*]\s+/.test(lines[i]) &&
      !/^(\s*)\d+\.\s+/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', inlines: parseInline(paraLines.join('\n')) });
    }
  }

  return blocks;
}

const InlineText = React.memo(function InlineText({ tokens, color, codeColor, codeBg }: {
  tokens: InlineToken[];
  color: string;
  codeColor: string;
  codeBg: string;
}) {
  return (
    <>
      {tokens.map((token, i) => {
        switch (token.type) {
          case 'text':
            return <Text key={i}>{token.value}</Text>;
          case 'bold':
            return <Text key={i} style={{ fontWeight: '600' }}>{token.value}</Text>;
          case 'italic':
            return <Text key={i} style={{ fontStyle: 'italic' }}>{token.value}</Text>;
          case 'code':
            return (
              <Text
                key={i}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: codeColor,
                  backgroundColor: codeBg,
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderRadius: RADIUS.xs,
                }}
              >
                {token.value}
              </Text>
            );
          case 'link':
            return (
              <Text key={i} style={{ color, textDecorationLine: 'underline' }}>
                {token.text}
              </Text>
            );
          case 'placeholder':
            return (
              <Text
                key={i}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: '500',
                  color: codeColor,
                  backgroundColor: codeBg,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: RADIUS.xs,
                  overflow: 'hidden',
                }}
              >
                {token.value}
              </Text>
            );
          default:
            return null;
        }
      })}
    </>
  );
});

export const MarkdownRenderer = React.memo(function MarkdownRenderer({ content, style }: MarkdownRendererProps) {
  const { theme } = useTheme();
  const c = theme.color;

  const blocks = useMemo(() => parseBlocks(content), [content]);

  const textColor = c.onBackground;
  const mutedColor = c.onSurfaceVariant;
  const codeColor = c.primary;
  const codeBg = c.surface;
  const borderColor = c.outlineVariant;

  return (
    <View style={[styles.container, style]}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const headingStyle =
              block.level === 1 ? TYPOGRAPHY.heading :
              block.level === 2 ? TYPOGRAPHY.subheading :
              block.level === 3 ? TYPOGRAPHY.bodySemibold :
              TYPOGRAPHY.captionSemibold;
            return (
              <Text
                key={index}
                style={[
                  headingStyle,
                  {
                    color: textColor,
                    marginTop: index > 0 ? SPACING.lg : 0,
                    marginBottom: SPACING.sm,
                  },
                ]}
              >
                <InlineText tokens={block.inlines} color={codeColor} codeColor={codeColor} codeBg={codeBg} />
              </Text>
            );
          }

          case 'paragraph':
            return (
              <Text
                key={index}
                style={[
                  TYPOGRAPHY.body,
                  {
                    color: textColor,
                    lineHeight: 24,
                    marginTop: index > 0 ? SPACING.md : 0,
                  },
                ]}
              >
                <InlineText tokens={block.inlines} color={codeColor} codeColor={codeColor} codeBg={codeBg} />
              </Text>
            );

          case 'list-item':
            return (
              <View
                key={index}
                style={[
                  styles.listItem,
                  { marginTop: index > 0 ? SPACING.xs : SPACING.sm },
                ]}
              >
                <Text style={[TYPOGRAPHY.body, { color: mutedColor, minWidth: 20 }]}>
                  {block.ordered ? `${block.number}.` : '\u2022'}
                </Text>
                <Text style={[TYPOGRAPHY.body, { color: textColor, flex: 1, lineHeight: 24 }]}>
                  <InlineText tokens={block.inlines} color={codeColor} codeColor={codeColor} codeBg={codeBg} />
                </Text>
              </View>
            );

          case 'blockquote':
            return (
              <View
                key={index}
                style={[
                  styles.blockquote,
                  {
                    borderLeftColor: borderColor,
                    marginTop: index > 0 ? SPACING.md : SPACING.sm,
                  },
                ]}
              >
                <Text style={[TYPOGRAPHY.body, { color: mutedColor, fontStyle: 'italic', lineHeight: 24 }]}>
                  <InlineText tokens={block.inlines} color={codeColor} codeColor={codeColor} codeBg={codeBg} />
                </Text>
              </View>
            );

          case 'code-block':
            return (
              <View
                key={index}
                style={[
                  styles.codeBlock,
                  {
                    backgroundColor: codeBg,
                    borderColor,
                    marginTop: index > 0 ? SPACING.md : SPACING.sm,
                  },
                ]}
              >
                {block.language && (
                  <Text style={[TYPOGRAPHY.small, { color: mutedColor, marginBottom: SPACING.xs }]}>
                    {block.language}
                  </Text>
                )}
                <Text style={[TYPOGRAPHY.caption, { color: textColor, fontFamily: 'monospace', lineHeight: 20 }]}>
                  {block.code}
                </Text>
              </View>
            );

          case 'table':
            return (
              <View
                key={index}
                style={[
                  styles.table,
                  { borderColor, marginTop: index > 0 ? SPACING.md : SPACING.sm },
                ]}
              >
                {/* Header */}
                <View style={[styles.tableRow, { backgroundColor: codeBg, borderBottomColor: borderColor }]}>
                  {block.headers.map((header, hi) => (
                    <View key={hi} style={[styles.tableCell, { borderRightColor: borderColor }]}>
                      <Text style={[TYPOGRAPHY.captionSemibold, { color: textColor }]}>
                        {header}
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Rows */}
                {block.rows.map((row, ri) => (
                  <View
                    key={ri}
                    style={[styles.tableRow, { borderBottomColor: borderColor }]}
                  >
                    {row.map((cell, ci) => (
                      <View key={ci} style={[styles.tableCell, { borderRightColor: borderColor }]}>
                        <Text style={[TYPOGRAPHY.body, { color: textColor, fontSize: 14 }]}>
                          {cell}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );

          case 'hr':
            return (
              <View
                key={index}
                style={[
                  styles.hr,
                  { backgroundColor: borderColor, marginTop: SPACING.lg, marginBottom: SPACING.md },
                ]}
              />
            );

          default:
            return null;
        }
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
  listItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  codeBlock: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.md,
  },
  table: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  hr: {
    height: 1,
  },
});
