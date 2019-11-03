const
	CALC_TARGET_RECT_KEY = Symbol('calc.target.rect'),
	CALC_POSITION_KEY = Symbol('calc.position'),
	POSITION_KEY = Symbol('position.key'),
	SHOW_DELAY_KEY = Symbol('show.delay.key'),
	SHOW_TIMEOUT_KEY = Symbol('future.show.key'),
	POSITIONS = Object.freeze({ far: 'far', near: 'near', below: 'below', above: 'above' }),
	DEFAULT_POSITION_FALLBACKS = Object.freeze([
		POSITIONS.below,
		POSITIONS.above,
		POSITIONS.far,
		POSITIONS.near
	]),
	DEFAULT_SHOW_DELAY = 253;

let positionFallbacks = DEFAULT_POSITION_FALLBACKS;

export {
	POSITIONS,
	tooltip,
	setPositionFallbacks
}

function tooltip(target, content, options) {
	//	validate and set defaults
	if (!target || target.nodeType !== Node.ELEMENT_NODE) {
		throw new Error('target MUST be an Element node');
	}
	if (!target.id) {
		throw new Error('target MUST have a non-empty (unique) "id" property');
	}
	if (!content || (typeof content !== 'string' && content.nodeType !== Node.ELEMENT_NODE && content.nodeType !== Node.TEXT_NODE)) {
		throw new Error('invalid content, MUST either be a "string", an Element node or a Text node');
	}
	//	TODO: validate the target and the options

	const tt = document.createElement('tool-tip');
	typeof content === 'string'
		? tt.innerText = content
		: tt.appendChild(content);
	document.body.appendChild(tt);
	tt.show(target);
	return tt;
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
			transition: opacity 333ms, transform 333ms;
		}

		:host(.pre-shown) {
			display: block;
			opacity: 0;
			transform: scale(0.85);
		}

		:host(.shown) {
			display: block;
			opacity: 1;
			transform: scale(1);
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
		if (!this[POSITION_KEY]) {
			this[POSITION_KEY] = this.dataset.position || positionFallbacks[0];
		}
		if (!this[SHOW_DELAY_KEY]) {
			this[SHOW_DELAY_KEY] = this.dataset.showDelay || DEFAULT_SHOW_DELAY;
		}

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
			c.addEventListener('mouseenter', event => {
				if (!this[SHOW_TIMEOUT_KEY]) {
					this[SHOW_TIMEOUT_KEY] = setTimeout(() => {
						this[SHOW_TIMEOUT_KEY] = null;
						this.show(event.target);
					}, this.showDelay);
				}
			});
			c.addEventListener('mouseleave', event => {
				if (this.classList.contains('shown')) {
					this.hide();
				} else if (this[SHOW_TIMEOUT_KEY]) {
					clearTimeout(this[SHOW_TIMEOUT_KEY]);
					this[SHOW_TIMEOUT_KEY] = null;
				}
			});
		});
	}

	show(target) {
		this.classList.add('pre-shown');
		const targetRect = this[CALC_TARGET_RECT_KEY](target);
		const selfPosition = this[CALC_POSITION_KEY](targetRect);
		Object.assign(this.style, selfPosition);
		this.classList.replace('pre-shown', 'shown');
	}

	hide() {
		this.classList.remove('shown');
	}

	get position() {
		return this[POSITION_KEY];
	}

	set position(position) {
		if (position in POSITIONS && this[POSITION_KEY] !== position) {
			this[POSITION_KEY] = position;
		}
	}

	get showDelay() {
		return this[SHOW_DELAY_KEY];
	}

	set showDelay(showDelay) {
		if (typeof showDelay === 'number' && !isNaN(showDelay) && this[SHOW_DELAY_KEY] !== showDelay) {
			this[SHOW_DELAY_KEY] = showDelay;
		}
	}

	[CALC_TARGET_RECT_KEY](e) {
		return e.getBoundingClientRect();
	}

	[CALC_POSITION_KEY](targetRect) {
		const positions = [this.position];
		positions.push(...positionFallbacks.filter(pf => positions.indexOf(pf) < 0));

		const
			w = this.offsetWidth,
			h = this.offsetHeight,
			vw = document.documentElement.clientWidth,
			vh = document.documentElement.clientHeight,
			result = {},
			rtl = getComputedStyle(document.body).direction === 'rtl';
		positions.some(p => {
			if (p === POSITIONS.below && h <= vh - targetRect.bottom - 12) {
				//	below
				let l = targetRect.x + targetRect.width / 2 - w / 2;
				l = Math.max(12, l);
				l = Math.min(vw - w - 12, l);
				result.top = (targetRect.bottom + 12) + 'px';
				result.left = l + 'px';
			} else if (p === POSITIONS.above && h <= targetRect.y - 12) {
				//	above
				let l = targetRect.x + targetRect.width / 2 - w / 2;
				l = Math.max(12, l);
				l = Math.min(vw - w - 12, l);
				result.top = (targetRect.y - h - 12) + 'px';
				result.left = l + 'px';
			} else if (((p === POSITIONS.far && rtl) || (p === POSITIONS.near && !rtl)) && targetRect.x >= w + 12) {
				//	left
				let t = targetRect.y + targetRect.height / 2 - h / 2;
				t = Math.max(12, t);
				t = Math.min(vh - h - 12, t);
				result.top = t + 'px';
				result.left = (targetRect.x - w - 12) + 'px';
			} else if (vw - targetRect.right >= w + 12) {
				//	right
				let t = targetRect.y + targetRect.height / 2 - h / 2;
				t = Math.max(12, t);
				t = Math.min(vh - h - 12, t);
				result.top = t + 'px';
				result.left = (targetRect.right + 12) + 'px';
			}

			return result.top && result.left;
		});

		return result;
	}
});