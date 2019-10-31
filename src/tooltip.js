const
	POSITIONS = { left: 'left', right: 'right', above: 'above', below: 'below' },
	DEFAULT_POSITION_FALLBACKS = [
		document.dir === 'rtl' ? POSITIONS.left : POSITIONS.right,
		document.dir === 'rtl' ? POSITIONS.right : POSITIONS.left,
		POSITIONS.above,
		POSITIONS.below
	];

let positionFallbacks = DEFAULT_POSITION_FALLBACKS;

export {
	POSITIONS,
	tooltip,
	setPositionFallbacks
}

function tooltip(target, options) {

}

function setPositionFallbacks(...pfs) {
	positionFallbacks = pfs.filter(pf => pf in POSITIONS);
	positionFallbacks.push(...DEFAULT_POSITION_FALLBACKS.filter(dpf => positionFallbacks.indexOf(dpf) < 0));
}

const template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			position: fixed;
			padding: 24px;
			display: none;
			z-index: 9999;
			overflow: hidden;
			border-radius: 12px;
			box-shadow: 0 0 12px rgba(100,100,100,0.5);
			transition: all 333ms;
		}

		:host(.pre-shown) {
			display: block;
			opacity: 0;
		}

		:host(.shown) {
			display: block;
			opacity: 1;
		}

		:host(.inverse) {
			color: #fff;
			background-color: #000;
			box-shadow: none;
		}
	</style>

	<slot></slot>
`;

customElements.define('tool-tip', class extends HTMLElement {
	constructor() {
		super();
		const s = this.attachShadow({ mode: 'open' });
		s.appendChild(template.content.cloneNode(true));
	}

	connectedCallback() {
		const
			targetId = this.dataset.targetId,
			targetClass = this.dataset.targetClass;
		if (!targetId && !targetClass) {
			console.error('tooltip has nor target-id neither target-class defined, this tooltip will not be used');
			return;
		}
		const root = this.getRootNode();
		const candidates = root.querySelectorAll(targetId ? ('#' + targetId) : ('.' + targetClass));
		if (!candidates.length) {
			console.error('failed to match any target element by id "' + targetId + '", this tooltip will not be used');
			return;
		}
		candidates.forEach(c => {
			c.addEventListener('mouseenter', event => this.show(event.target));
			c.addEventListener('mouseleave', event => this.hide());
		});
	}

	show(target) {
		this.classList.add('pre-shown');
		const targetRect = this.getTargetRect(target);
		const selfPosition = {
			top: (targetRect.y + targetRect.height / 2 - this.offsetHeight / 2) + 'px',
			left: targetRect.x + targetRect.width + 12 + 'px'
		};
		Object.assign(this.style, selfPosition);
		this.classList.replace('pre-shown', 'shown');
	}

	hide() {
		this.classList.remove('shown');
	}

	getTargetRect(e) {
		return e.getBoundingClientRect();
	}
});