// EC Nordic's component registry. This site's half of the render engine. Each
// ComponentDef reproduces the directive→hast build that lived in the old
// rehype-ec-primitives.ts, now composed from cairn-cms's shared helpers
// (cardShell/markFirstList/iconSpan) + this site's icon set + class names.
// cairn-cms (the engine) owns the machinery (stamp, slot partition, dispatch,
// rise stagger, recursion); this file is site code that owns the presentation.
//
// The engine passes each build a ComponentContext: declared attributes plus the
// partitioned slots. The title slot carries the directive [label] and renders into
// an <h2>; rehypeSlug runs after the dispatch, so an emitted <h2> picks up the same
// slug id the old `## heading` produced. The body slot carries the unmarked content.
import { h } from 'hastscript';
import type { Element, ElementContent } from 'hast';
import {
	defineRegistry,
	glyph,
	iconSpan,
	cardShell,
	markFirstList,
	isElement,
	type ComponentDef,
	type MakeIcon,
} from '@glw907/cairn-cms';
import { ICON_PATHS } from './icons';

// The structured input a build receives. Derived from the engine's ComponentDef so the
// site never needs the engine to export the ComponentContext type by name.
type Ctx = Parameters<ComponentDef['build']>[0];

const ecGlyph = (name: string): Element => glyph(name, ICON_PATHS);
const makeIcon: MakeIcon = (name, role) => iconSpan(ecGlyph(name), role);

const CARD_CLASS = ['card', 'ec-card', 'bg-base-100', 'border', 'border-base-300', 'shadow-sm'];
const CTA_CLASS = ['card', 'ec-card', 'ec-cta', 'bg-base-100', 'border', 'border-primary/30', 'shadow-sm'];

// Read a string attribute, or undefined when absent or non-string.
function strAttr(ctx: Ctx, key: string): string | undefined {
	const value = ctx.attributes[key];
	return typeof value === 'string' ? value : undefined;
}

// The shared head row: `<div class="ec-head">` holding the optional icon span and the
// titled <h2> as direct siblings (no ec-head-text wrapper). The <h2> gets its slug id
// from rehypeSlug, which runs after this dispatch.
function head(ctx: Ctx): Element {
	const icon = strAttr(ctx, 'icon');
	const role = strAttr(ctx, 'role');
	const kids: ElementContent[] = [];
	if (icon) kids.push(makeIcon(icon, role));
	kids.push(h('h2', { className: ['card-title'] }, ctx.slot('title')));
	return h('div', { className: ['ec-head'] }, kids);
}

function buildCard(ctx: Ctx): Element {
	return cardShell(CARD_CLASS, [head(ctx), h('div', { className: ['section-body'] }, ctx.slot('body'))]);
}

function buildPassage(ctx: Ctx): Element {
	return h('section', { className: ['ec-passage'] }, [
		head(ctx),
		h('div', { className: ['section-body'] }, ctx.slot('body')),
	]);
}

function buildAside(ctx: Ctx): Element {
	const icon = strAttr(ctx, 'icon');
	const role = strAttr(ctx, 'role');
	const title = ctx.slot('title');
	const kids: ElementContent[] = [];
	if (title.length > 0) {
		const headKids: ElementContent[] = [];
		if (icon) headKids.push(makeIcon(icon, role));
		headKids.push(h('h2', { className: ['card-title'] }, title));
		kids.push(h('div', { className: ['ec-head'] }, headKids));
	} else if (icon) {
		kids.push(makeIcon(icon, role));
	}
	kids.push(h('div', { className: ['section-body'] }, ctx.slot('body')));
	return h('aside', { className: ['ec-aside'] }, kids);
}

function buildFigure(ctx: Ctx): Element {
	const caption = ctx.slot('title');
	const kids: ElementContent[] = [...ctx.slot('body')];
	if (caption.length > 0) kids.push(h('figcaption', {}, caption));
	return h('figure', { className: ['ec-figure'] }, kids);
}

function buildGallery(ctx: Ctx): Element {
	const kids: ElementContent[] = [];
	if (ctx.slot('title').length > 0) kids.push(h('h2', { className: ['card-title'] }, ctx.slot('title')));
	kids.push(h('div', { className: ['ec-gallery'] }, ctx.slot('body')));
	return h('section', { className: ['ec-gallery-section'] }, kids);
}

function buildGrid(ctx: Ctx): Element {
	const body = ctx.slot('body');
	const titled = ctx.slot('title').length > 0;
	const ul = markFirstList(body); // tags the first <ul> as ec-grid in place
	if (!titled) return ul ?? h('div', body); // nested use: emit the bare ec-grid list
	// Keep the whole body (intro paragraph plus the now-ec-grid list); the mutation above
	// already marked the list in place.
	return cardShell(CARD_CLASS, [head(ctx), h('div', { className: ['section-body'] }, body)]);
}

function buildAlert(ctx: Ctx): Element {
	let icon = strAttr(ctx, 'icon');
	const role = strAttr(ctx, 'role');
	// The stamper applies defaultIconByRole only to its special dataIcon marker, not to the
	// declared dataAttrIcon this build reads, so a caution alert with no explicit icon owns
	// its default here.
	if (!icon && role === 'caution') icon = 'warning';
	const titleKids: ElementContent[] = [];
	if (icon) titleKids.push(ecGlyph(icon)); // glyph inline at the label head
	titleKids.push(...ctx.slot('title'));
	const h2 = h('h2', {}, titleKids); // no card-title class; rehypeSlug adds the id
	return h('div', { role: 'alert', className: ['ec-alert', `ec-alert-${role}`] }, [
		h('div', { className: ['ec-alert-body'] }, [h2, ...ctx.slot('body')]),
	]);
}

// Append btn classes to the authored `a.download-link` (raw HTML, reparsed by
// rehype-raw), wherever it sits in the body.
function promoteDownloadLink(children: ElementContent[]): void {
	for (const c of children) {
		if (!isElement(c)) continue;
		const cls = c.properties?.className;
		if (c.tagName === 'a' && Array.isArray(cls) && cls.includes('download-link')) {
			c.properties.className = [...cls, 'btn', 'btn-primary'];
		} else {
			promoteDownloadLink(c.children as ElementContent[]);
		}
	}
}

function buildCta(ctx: Ctx): Element {
	const body = ctx.slot('body');
	promoteDownloadLink(body);
	const icon = strAttr(ctx, 'icon');
	return h('section', { className: CTA_CLASS }, [
		h('div', { className: ['card-body', 'items-center', 'text-center'] }, [
			h('span', { className: ['ec-chip'] }, [ecGlyph(icon ?? '')]),
			h('h2', { className: ['card-title'] }, ctx.slot('title')),
			h('div', { className: ['section-body'] }, body),
		]),
	]);
}

function buildPanel(ctx: Ctx): Element {
	const icon = strAttr(ctx, 'icon');
	const role = strAttr(ctx, 'role');
	const kids: ElementContent[] = [];
	if (icon) kids.push(iconSpan(ecGlyph(icon), role));
	kids.push(...ctx.slot('body'));
	return h('div', { className: ['ec-panel'] }, kids);
}

function buildSplit(ctx: Ctx): Element {
	// The body holds the nested panels, already turned into .ec-panel divs by the
	// dispatcher's recursion (panel is not a declared split slot, so it stays in body).
	const panels = ctx
		.slot('body')
		.filter(
			(c) => isElement(c) && Array.isArray(c.properties?.className) && c.properties.className.includes('ec-panel'),
		);
	const headEl = h('div', { className: ['ec-head'] }, [h('h2', { className: ['card-title'] }, ctx.slot('title'))]); // no icon
	const body = h('div', { className: ['section-body'] }, [h('div', { className: ['ec-split'] }, panels)]);
	return cardShell(CARD_CLASS, [headEl, body]);
}

const ICON_ATTR = { key: 'icon', label: 'Icon', type: 'icon' as const };
const ROLE_ATTR = { key: 'role', label: 'Role', type: 'select' as const, options: ['primary', 'secondary'] };
const TITLE_SLOT = { name: 'title', label: 'Title', kind: 'inline' as const, required: true };
const OPTIONAL_TITLE_SLOT = { name: 'title', label: 'Title', kind: 'inline' as const };
const BODY_SLOT = { name: 'body', label: 'Body', kind: 'markdown' as const };

const components: ComponentDef[] = [
	{
		name: 'card',
		label: 'Card',
		description: 'A bordered card with a titled head row and body content.',
		insertTemplate: ':::card[Title]{icon="flag"}\nBody copy.\n:::',
		build: buildCard,
		attributes: [ICON_ATTR, ROLE_ATTR],
		slots: [TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'grid',
		label: 'Grid',
		description: 'A card whose first list lays out as a responsive grid.',
		insertTemplate: ':::grid[Title]{icon="path"}\n- Item one\n- Item two\n:::',
		build: buildGrid,
		attributes: [ICON_ATTR, ROLE_ATTR],
		slots: [TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'alert',
		label: 'Alert',
		description: 'A callout box keyed to a role (e.g. caution).',
		insertTemplate: ':::alert[Heads up]{role="caution"}\nWhat to watch for.\n:::',
		build: buildAlert,
		attributes: [ICON_ATTR, { key: 'role', label: 'Role', type: 'select', required: true, options: ['caution'] }],
		slots: [TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'cta',
		label: 'Call to action',
		description: 'A centered card with a chip icon and an emphasized link.',
		insertTemplate:
			':::cta[Get started]{icon="flag"}\n<a class="download-link" href="#">Sign up</a>\n:::',
		build: buildCta,
		attributes: [ICON_ATTR],
		slots: [TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'split',
		label: 'Split',
		description: 'A card laying nested :::panel blocks side by side.',
		insertTemplate:
			'::::split[Title]\n:::panel{icon="hand-coins"}\nFirst panel.\n:::\n\n:::panel{icon="handshake"}\nSecond panel.\n:::\n::::',
		build: buildSplit,
		slots: [TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'panel',
		label: 'Panel',
		description: 'A single panel with an optional icon (used inside a split).',
		insertTemplate: ':::panel{icon="hand-coins"}\nPanel content.\n:::',
		build: buildPanel,
		attributes: [ICON_ATTR, ROLE_ATTR],
		slots: [BODY_SLOT],
	},
	{
		name: 'passage',
		label: 'Passage',
		description: 'A lightweight titled section without the card chrome.',
		insertTemplate: ':::passage[Title]{icon="compass"}\nBody copy.\n:::',
		build: buildPassage,
		attributes: [ICON_ATTR, ROLE_ATTR],
		slots: [TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'aside',
		label: 'Aside',
		description: 'A lightweight semantic aside for a gloss or side note. Not for warnings.',
		insertTemplate: ':::aside[Term]{icon="info"}\nA short definition or note.\n:::',
		build: buildAside,
		attributes: [ICON_ATTR, ROLE_ATTR],
		slots: [OPTIONAL_TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'figure',
		label: 'Figure',
		description: 'A captioned image. The body holds a markdown image; the title is the caption.',
		insertTemplate: ':::figure[Caption]\n![Alt text](/images/photo.webp)\n:::',
		build: buildFigure,
		slots: [OPTIONAL_TITLE_SLOT, BODY_SLOT],
	},
	{
		name: 'gallery',
		label: 'Gallery',
		description: 'A small set of images laid out in a responsive grid.',
		insertTemplate: ':::gallery[Title]\n![One](/images/one.webp)\n![Two](/images/two.webp)\n:::',
		build: buildGallery,
		slots: [OPTIONAL_TITLE_SLOT, BODY_SLOT],
	},
];

export const ecnordicRegistry = defineRegistry({ components });
