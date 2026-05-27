/**
 * Per-module entrance-cascade delay, as an inline `--rise` custom property.
 *
 * The page resolves as one top-to-bottom cascade: each module rises in on its
 * own delay, a tight `0.16 + index * 0.04s` step so the stack reads as a single
 * wave (see docs/design-language.md → Motion). Consumed by both the markdown
 * pipeline (passed to cairn-core's renderer as the rise formula) and the Svelte
 * component pages, so the timing has one source of truth. Paired with the global
 * `module-rise` keyframes in src/app.css.
 */
export function riseStyle(idx: number): string {
  return `--rise:${(0.16 + idx * 0.04).toFixed(2)}s`;
}
