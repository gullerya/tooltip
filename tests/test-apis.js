import { createSuite } from '../../node_modules/just-test/dist/just-test.min.js'
import { tooltip, POSITIONS } from '../../dist/tooltip.js';

const suite = createSuite({ name: 'Testing tooltip APIs' });

suite.runTest({ name: 'test A' }, test => {
	const
		divA = document.createElement('div'),
		divB = document.createElement('div'),
		divC = document.createElement('div');

	divA.id = 'div-a-id';
	divA.style.position = 'absolute';
	divA.style.top = '100px';
	divA.style.left = '100px';
	divA.style.width = '400px';
	divA.style.height = '200px';
	divA.style.overflow = 'auto';
	divA.style.outline = '2px solid blue';
	document.body.appendChild(divA);

	divB.classList.add('div-b-class');
	divB.style.position = 'absolute';
	divB.style.top = '400px';
	divB.style.left = '100px';
	divB.style.width = '200px';
	divB.style.height = '100px';
	divB.style.overflow = 'auto';
	divB.style.outline = '2px solid red';
	document.body.appendChild(divB);

	divC.id = 'div-c-id';
	divC.style.position = 'absolute';
	divC.style.top = '200px';
	divC.textContent = 'some thing to call out over';
	divC.style.outline = '2px solid green';
	document.body.appendChild(divC);

	const ttA = document.createElement('tool-tip');
	ttA.setAttribute('data-target-id', 'div-c-id');
	ttA.position = POSITIONS.above;
	ttA.textContent = 'Div A tooltip';
	document.body.appendChild(ttA);

	const ttB = document.createElement('tool-tip');
	ttB.classList.add('inverse');
	ttB.dataset.targetClass = 'div-b-class';
	ttB.dataset.position = POSITIONS.near;
	ttB.innerHTML = `
		<div>
			<div>
				<div>Line A: title</div>
				<div>Div B tooltip with a very very very very very very very very very very very very very very long content</div>
				<div>footnotes</div>
			</div>
		</div>
	`;
	document.body.appendChild(ttB);
});