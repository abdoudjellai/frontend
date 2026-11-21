/**
 * Minimal Markdown renderer for assistant replies: headings, paragraphs, bold/italic/code,
 * bullet and numbered lists, tables and rules. It builds React elements only (no innerHTML),
 * so model output can never inject HTML or scripts.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g

function inline(text) {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={i} className="rounded bg-blue-100 px-1 text-[0.85em]">{part.slice(1, -1)}</code>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line)
const isTableSeparator = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line)
const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
const BULLET = /^\s*[-*•]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^(#{1,4})\s+(.*)$/

function parse(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { i++; continue }

    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = cells(line)
      const rows = []
      i += 2
      while (i < lines.length && isTableRow(lines[i])) rows.push(cells(lines[i++]))
      blocks.push({ type: 'table', header, rows })
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) { blocks.push({ type: 'heading', text: heading[2] }); i++; continue }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push({ type: 'rule' }); i++; continue }

    const list = BULLET.test(line) ? ['ul', BULLET] : NUMBERED.test(line) ? ['ol', NUMBERED] : null
    if (list) {
      const [type, re] = list
      const items = []
      while (i < lines.length && re.test(lines[i])) items.push(re.exec(lines[i++])[1])
      blocks.push({ type, items })
      continue
    }

    const paragraph = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !HEADING.test(lines[i]) &&
      !BULLET.test(lines[i]) &&
      !NUMBERED.test(lines[i]) &&
      !(isTableRow(lines[i]) && isTableSeparator(lines[i + 1] ?? ''))
    ) {
      paragraph.push(lines[i++])
    }
    blocks.push({ type: 'p', lines: paragraph })
  }
  return blocks
}

export default function Markdown({ text }) {
  return (
    <div dir="auto" className="space-y-2.5 text-sm leading-relaxed">
      {parse(text).map((block, i) => {
        switch (block.type) {
          case 'heading':
            return <h3 key={i} className="pt-1 font-bold text-ink">{inline(block.text)}</h3>
          case 'rule':
            return <hr key={i} className="border-blue-100" />
          case 'ul':
            return <ul key={i} className="list-disc space-y-1 ps-5">{block.items.map((item, j) => <li key={j}>{inline(item)}</li>)}</ul>
          case 'ol':
            return <ol key={i} className="list-decimal space-y-1 ps-5">{block.items.map((item, j) => <li key={j}>{inline(item)}</li>)}</ol>
          case 'table':
            return (
              <div key={i} className="overflow-x-auto rounded-lg border border-blue-100 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-50 text-muted">
                    <tr>{block.header.map((h, j) => <th key={j} className="whitespace-nowrap px-3 py-2 font-bold">{inline(h)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-t border-blue-50">
                        {row.map((cell, c) => <td key={c} className="px-3 py-2 align-top">{inline(cell)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          default:
            return (
              <p key={i}>
                {block.lines.map((l, j) => (
                  <span key={j}>{j > 0 && <br />}{inline(l)}</span>
                ))}
              </p>
            )
        }
      })}
    </div>
  )
}
