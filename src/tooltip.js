const
	ENTRIES_LIST = Symbol('entries.list'),
	CURRENT_INDEX = Symbol('current.entry'),
	NEXT_METHOD = Symbol('next.method'),
	PREV_METHOD = Symbol('prev.method'),
	MOVE_TO_METHOD = Symbol('move.to.method');

export function callout(entries) {
	//	create valid array of targets
	const ea = (Array.isArray(entries) ? entries : [entries])
		.filter(e => e && e.target && e.target.nodeType === Node.ELEMENT_NODE && e.content)
		.map(e => {
			const re = { target: e.target };
			if (e.content.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
				re.content = e.content;
			} else {
				const tmpDF = document.createDocumentFragment();
				tmpDF.appendChild(document.createTextNode(e.content));
				re.content = tmpDF;
			}
			return re;
		});

	//	validate
	if (!ea.length) {
		console.error('no (valid) targets to call out over');
		return;
	}

	//	start callout flow
	const
		co = document.createElement('call-out'),
		po = window.getComputedStyle(document.documentElement).overflow;
	document.documentElement.style.overflow = 'hidden';

	document.documentElement.appendChild(co);
	co[ENTRIES_LIST] = ea;
	co[NEXT_METHOD]();

	co.addEventListener('close', () => {
		document.documentElement.style.overflow = po;
	});
}

const template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 9999;
			overflow: hidden;
		}

		.man-pan {
			position: absolute;
			display: flex;
			justify-content: center;
			width: 100%;
			cursor: default;
			user-select: none;
		}

		.man-pan.above {
			top: 48px;
		}

		.man-pan.below {
			bottom: 48px;
		}

		.button {
			flex: 0 0 48px;
			height: 32px;
			margin: 0 8px;
			border: 1px solid #646464;
			border-radius: 8px;
			box-sizing: border-box;
			box-shadow: inset 0 16px 24px 0px rgba(96, 96, 96, 0.4);
			background-color: #fff;
			font-size: 18px;
			font-weight: bold;
			line-height: 32px;
			display: flex;
			justify-content: center;
		}

		.callout-vilon {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		.mask-overlay {
			x: 0;
			y: 0;
			width: 100%;
			height: 100%;
			fill: #aaa;
		}

		.mask-window {
			x: calc(50% - 12px);
			y: calc(50% - 12px);
			width: 16px;
			height: 16px;
			rx: 8px;
			transition: all 400ms ease;
		}
	</style>

	<svg class="callout-vilon">
		<defs>
			<mask id="callout-mask">
				<rect class="mask-overlay"/>
				<rect class="mask-window"/>
			</mask>
		</defs>
		<rect x="0" y="0" width="100%" height="100%" mask="url(#callout-mask)"/>
	</svg>
	<div class="man-pan">
		<div class="button prev">&#11207;</div>
		<div class="button next">&#11208;</div>
		<div class="button close">&times;</div>
	</div>
`;

customElements.define('call-out', class extends HTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.appendChild(template.content.cloneNode(true));
		s.querySelector('.button.next').addEventListener('click', () => {
			this[NEXT_METHOD]();
		});
		s.querySelector('.button.prev').addEventListener('click', () => {
			this[PREV_METHOD]();
		});
		s.querySelector('.button.close').addEventListener('click', () => {
			this.parentNode.removeChild(this);
			this.dispatchEvent(new Event('close'));
		});
		this[CURRENT_INDEX] = -1;
	}

	[NEXT_METHOD]() {
		const
			entries = this[ENTRIES_LIST],
			nextIndex = this[CURRENT_INDEX] + 1;

		if (!entries || !entries.length) {
			console.error('no entries list');
			return;
		}
		if (nextIndex >= entries.length) {
			console.error('should NOT "next" after last');
			return;
		}

		this[MOVE_TO_METHOD](entries[nextIndex]);
		this[CURRENT_INDEX] = nextIndex;
		if (nextIndex === 0) {
			this.classList.add('first');
		} else {
			this.classList.remove('first');
		}
		if (nextIndex === entries.length - 1) {
			this.classList.add('last');
		}
	}

	[PREV_METHOD]() {
		const
			entries = this[ENTRIES_LIST],
			prevIndex = this[CURRENT_INDEX] - 1;

		if (!entries || !entries.length) {
			console.error('no entries list');
			return;
		}
		if (prevIndex < 0) {
			console.error('should NOT "prev" before first');
			return;
		}

		this[MOVE_TO_METHOD](entries[prevIndex]);
		this[CURRENT_INDEX] = prevIndex;
		if (prevIndex === 0) {
			this.classList.add('first');
		}
		if (prevIndex === entries.length - 2) {
			this.classList.remove('last');
		}
	}

	[MOVE_TO_METHOD](entry) {
		this.ensureElementSeen(entry.target);

		const
			r = this.getScreenRect(entry.target),
			av = {
				x: (r.x - 4) + 'px',
				y: (r.y - 4) + 'px',
				width: (Math.max(16, r.width) + 8) + 'px',
				height: (Math.max(16, r.height) + 8) + 'px'
			},
			m = this.shadowRoot.querySelector('.mask-window');

		Object.assign(m.style, av);

		const
			mp = this.shadowRoot.querySelector('.man-pan');
		if (r.bottom > document.documentElement.clientHeight / 2) {
			mp.classList.remove('below')
			mp.classList.add('above');
		} else {
			mp.classList.remove('above')
			mp.classList.add('below');
		}
	}

	ensureElementSeen(e) {
		e.scrollIntoView();
	}

	getScreenRect(e) {
		return e.getBoundingClientRect();
	}
});