// EC Nordic's component registry — this site's half of the render engine. Each
// ComponentDef reproduces the directive→hast build that lived in the old
// rehype-ec-primitives.ts, now composed from cairn-cms's shared helpers
// (splitHead/cardShell/markFirstList/iconSpan) + this site's icon set + class
// names. cairn-cms (the engine) owns the machinery (stamp, dispatch, rise stagger,
// recursion); this file is site code that owns the presentation.
import { h } from 'hastscript';
import type { Element, ElementContent, Properties } from 'hast';
import {
	defineRegistry,
	glyph,
	iconSpan,
	splitHead,
	cardShell,
	markFirstList,
	strProp,
	isElement,
	type ComponentDef,
	type MakeIcon,
} from '@glw907/cairn-cms';
import { ICON_PATHS } from './icons';

const ecGlyph = (name: string): Element => glyph(name, ICON_PATHS);
const makeIcon: MakeIcon = (name, role) => iconSpan(ecGlyph(name), role);

const CARD_CLASS = ['card', 'ec-card', 'bg-base-100', 'border', 'border-base-300', 'shadow-sm'];
const CTA_CLASS = ['card', 'ec-card', 'ec-cta', 'bg-base-100', 'border', 'border-primary/30', 'shadow-sm'];

function buildCard(node: Element, rise?: string): Element {
	const { head, rest } = splitHead(node, makeIcon);
	return cardShell(CARD_CLASS, rise, [head, h('div', { className: ['section-body'] }, rest)]);
}

function buildPassage(node: Element, rise?: string): Element {
	const { head, rest } = splitHead(node, makeIcon);
	const properties: Properties = { className: ['ec-passage'] };
	if (rise) properties.style = rise;
	return h('section', properties, [head, h('div', { className: ['section-body'] }, rest)]);
}

function buildGrid(node: Element, rise?: string): Element {
	const children = node.children as ElementContent[];
	const hasHeading = children.some((c) => isElement(c) && c.tagName === 'h2');
	const ul = markFirstList(children);
	if (!hasHeading) return ul ?? node; // nested use: emit the bare ec-grid list
	const { head, rest } = splitHead(node, makeIcon);
	return cardShell(CARD_CLASS, rise, [head, h('div', { className: ['section-body'] }, rest)]);
}

function buildAlert(node: Element, rise?: string): Element {
	const children = node.children as ElementContent[];
	const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
	const h2 = children[i] as Element;
	const icon = strProp(node, 'dataIcon');
	if (icon) (h2.children as ElementContent[]).unshift(ecGlyph(icon)); // icon inline at the label head
	const rest = children.filter((_, j) => j !== i);
	const role = strProp(node, 'dataRole');
	const properties: Properties = { role: 'alert', className: ['ec-alert', `ec-alert-${role}`] };
	if (rise) properties.style = rise;
	return h('div', properties, [h('div', { className: ['ec-alert-body'] }, [h2, ...rest])]);
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

function buildCta(node: Element, rise?: string): Element {
	const children = node.children as ElementContent[];
	const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
	const h2 = children[i] as Element;
	h2.properties = { ...h2.properties, className: ['card-title'] };
	const rest = children.filter((_, j) => j !== i);
	promoteDownloadLink(rest);
	const icon = strProp(node, 'dataIcon');
	const properties: Properties = { className: CTA_CLASS };
	if (rise) properties.style = rise;
	return h('section', properties, [
		h('div', { className: ['card-body', 'items-center', 'text-center'] }, [
			h('span', { className: ['ec-chip'] }, [ecGlyph(icon ?? '')]),
			h2,
			h('div', { className: ['section-body'] }, rest),
		]),
	]);
}

function buildPanel(node: Element): Element {
	const icon = strProp(node, 'dataIcon');
	const role = strProp(node, 'dataRole');
	const kids: ElementContent[] = [];
	if (icon) kids.push(iconSpan(ecGlyph(icon), role));
	kids.push(...(node.children as ElementContent[]));
	return h('div', { className: ['ec-panel'] }, kids);
}

function buildSplit(node: Element, rise?: string): Element {
	// Panels were already turned into .ec-panel divs by the dispatcher's recursion.
	const children = node.children as ElementContent[];
	const i = children.findIndex((c) => isElement(c) && c.tagName === 'h2');
	const h2 = children[i] as Element;
	h2.properties = { ...h2.properties, className: ['card-title'] };
	const panels = children.filter(
		(c) => isElement(c) && Array.isArray(c.properties?.className) && c.properties.className.includes('ec-panel'),
	);
	const head = h('div', { className: ['ec-head'] }, [h2]); // no icon at the split head
	const body = h('div', { className: ['section-body'] }, [h('div', { className: ['ec-split'] }, panels)]);
	return cardShell(CARD_CLASS, rise, [head, body]);
}

const components: ComponentDef[] = [
	{
		name: 'card',
		label: 'Card',
		description: 'A bordered card with a titled head row and body content.',
		insertTemplate: ':::card{icon=flag}\n## Title\n\nBody copy.\n:::',
		build: buildCard,
	},
	{
		name: 'grid',
		label: 'Grid',
		description: 'A card whose first list lays out as a responsive grid.',
		insertTemplate: ':::grid{icon=path}\n## Title\n\n- Item one\n- Item two\n:::',
		build: buildGrid,
	},
	{
		name: 'alert',
		label: 'Alert',
		description: 'A callout box keyed to a role (e.g. caution).',
		insertTemplate: ':::alert{role=caution}\n## Heads up\n\nWhat to watch for.\n:::',
		build: buildAlert,
		defaultIconByRole: { caution: 'warning' },
	},
	{
		name: 'cta',
		label: 'Call to action',
		description: 'A centered card with a chip icon and an emphasized link.',
		insertTemplate: ':::cta{icon=flag}\n## Get started\n\n<a class="download-link" href="#">Sign up</a>\n:::',
		build: buildCta,
	},
	{
		name: 'split',
		label: 'Split',
		description: 'A card laying nested :::panel blocks side by side.',
		insertTemplate: ':::split\n## Title\n\n:::panel{icon=hand-coins}\nFirst panel.\n:::\n\n:::panel{icon=handshake}\nSecond panel.\n:::\n:::',
		build: buildSplit,
	},
	{
		name: 'panel',
		label: 'Panel',
		description: 'A single panel with an optional icon (used inside a split).',
		insertTemplate: ':::panel{icon=hand-coins}\nPanel content.\n:::',
		build: buildPanel,
	},
	{
		name: 'passage',
		label: 'Passage',
		description: 'A lightweight titled section without the card chrome.',
		insertTemplate: ':::passage{icon=compass}\n## Title\n\nBody copy.\n:::',
		build: buildPassage,
	},
];

export const ecnordicRegistry = defineRegistry({ components });
