import { ICONS, type IconDrawing, type IconName } from './drawings';

export type { IconName };

interface IconProps {
  name: IconName;
  /** Any CSS length. Defaults to 1.25em so the icon scales with the text around it. */
  size?: number | string;
  /** Accessible label. Leave out for decorative icons next to text (they are hidden from screen readers). */
  title?: string;
  className?: string;
}

const PRINT = 'var(--icon-print, #ff6fae)';

function markup(d: IconDrawing): string {
  const body = d.body ?? '';
  const line = d.line ?? '';
  const parts: string[] = [];
  // The off-register "print" layer, nudged down and right.
  parts.push(
    `<g transform="translate(1.6 1.6)"><g fill="${PRINT}">${body}</g>` +
      `<g fill="none" stroke="${PRINT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${line}</g></g>`,
  );
  for (const [colour, el] of d.tint ?? []) {
    parts.push(colour ? `<g fill="${colour}">${el}</g>` : `<g fill="${PRINT}" opacity=".55">${el}</g>`);
  }
  parts.push(
    `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${body}${line}${d.detail ?? ''}</g>`,
  );
  if (d.mark) {
    parts.push(`<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${d.mark}</g>`);
  }
  if (d.ink) parts.push(`<g fill="currentColor">${d.ink}</g>`);
  return parts.join('');
}

// Built once; the drawings are static, trusted strings from drawings.ts.
const CACHE = new Map<IconName, string>();
function getMarkup(name: IconName): string {
  let m = CACHE.get(name);
  if (!m) {
    m = markup(ICONS[name]);
    CACHE.set(name, m);
  }
  return m;
}

/** An icon from the Fairest 100 set, drawn in the "Riso line" style. */
export function Icon({ name, size = '1.25em', title, className }: IconProps) {
  const html = (title ? `<title>${title.replace(/</g, '&lt;')}</title>` : '') + getMarkup(name);
  return (
    <svg
      className={`icon icon-${name}${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="-1.2 -1.2 26.4 26.4"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default Icon;
