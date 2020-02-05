import { getSuite } from '../../node_modules/just-test/dist/just-test.min.js'
import { tooltip, POSITIONS } from '../../dist/tooltip.js';

const suite = getSuite({ name: 'Testing tooltip APIs' });

suite.runTest({ name: 'test A' }, async test => {
	const
		divA = document.createElement('div'),
		divB = document.createElement('div'),
		divC = document.createElement('div');

	divA.style.position = 'absolute';
	divA.style.top = '100px';
	divA.style.left = '100px';
	divA.style.width = '400px';
	divA.style.height = '200px';
	divA.style.outline = '2px solid blue';
	document.body.appendChild(divA);

	divB.classList.add('div-b-class');
	divB.style.position = 'absolute';
	divB.style.top = '400px';
	divB.style.left = '100px';
	divB.style.width = '200px';
	divB.style.height = '100px';
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
	ttB.classList.add('light');
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

	//	automated flow with single tooltip
	const mtt = tooltip();
	mtt.show(divA, 'Div A tooltip');
	await test.waitMillis(3000);
	mtt.hide();
	await test.waitMillis(500);

	mtt.classList.add('light');
	const ttc = document.createElement('span');
	ttc.textContent = 'Div B tooltip';
	mtt.show(divB, ttc);
	await test.waitMillis(2000);
	mtt.hide();
	await test.waitMillis(500);

	mtt.classList.remove('light');
	mtt.show(divC, 'Div C tooltip');
	await test.waitMillis(1000);

	mtt.remove();
});

suite.runTest({ name: 'test tooltip in shadow DOM' }, async test => {
	const
		divS = document.createElement('div'),
		divT = document.createElement('div');

	divS.style.position = 'absolute';
	divS.style.top = '200px';
	divS.style.left = '200px';
	divS.style.width = '400px';
	divS.style.height = '200px';
	divS.style.outline = '2px solid blue';
	document.body.appendChild(divS);

	divT.id = 'div-in-shadow';
	divT.style.outline = '2px solid gray';
	divT.textContent = 'target in shadow';
	divS.attachShadow({ mode: 'open' }).appendChild(divT);

	const tt = document.createElement('tool-tip');
	tt.dataset.targetId = 'div-in-shadow';
	tt.position = POSITIONS.above;
	tt.textContent = 'Div in shadow tooltip';
	divS.shadowRoot.appendChild(tt);
});

suite.runTest({ name: 'test tooltip falback from below to above' }, async test => {
	const divS = document.createElement('div');

	divS.id = 'bottom-fallback-above';
	divS.style.position = 'absolute';
	divS.style.bottom = '20px';
	divS.style.left = '50px';
	divS.style.width = '50px';
	divS.style.height = '50px';
	divS.style.outline = '2px solid blue';
	document.body.appendChild(divS);

	const tt = document.createElement('tool-tip');
	tt.dataset.targetId = 'bottom-fallback-above';
	tt.textContent = 'Bottom fallback above';
	document.body.appendChild(tt);
});

suite.runTest({ name: 'test tooltip falback from below via above and far to near' }, async test => {
	const divS = document.createElement('div');

	divS.id = 'bottom-fallback-above-fallback-far-fallback-near';
	divS.style.position = 'absolute';
	divS.style.top = '20px';
	divS.style.bottom = '20px';
	divS.style.left = '150px';
	divS.style.width = '50px';
	divS.style.outline = '2px solid red';
	document.body.appendChild(divS);

	const tt = document.createElement('tool-tip');
	tt.dataset.targetId = 'bottom-fallback-above-fallback-far-fallback-near';
	tt.textContent = 'Bottom fallback above fallback far fallback near';
	document.body.appendChild(tt);
});

suite.runTest({ name: 'test tooltip falback from below via above to far' }, async test => {
	const divS = document.createElement('div');

	divS.id = 'bottom-fallback-above-fallback-far';
	divS.style.position = 'absolute';
	divS.style.top = '20px';
	divS.style.bottom = '20px';
	divS.style.left = '550px';
	divS.style.width = '50px';
	divS.style.outline = '2px solid green';
	document.body.appendChild(divS);

	const tt = document.createElement('tool-tip');
	tt.dataset.targetId = 'bottom-fallback-above-fallback-far';
	tt.textContent = 'Bottom fallback above fallback far';
	document.body.appendChild(tt);
});

suite.runTest({ name: 'test tooltip disabled' }, async test => {
	const divS = document.createElement('div');

	divS.id = 'disabled-tooltip';
	divS.style.position = 'absolute';
	divS.style.bottom = '20px';
	divS.style.right = '20px';
	divS.style.height = '50px';
	divS.style.width = '50px';
	divS.style.outline = '2px solid orange';
	document.body.appendChild(divS);

	const tt = document.createElement('tool-tip');
	tt.setAttribute('disabled', 'disabled');
	tt.dataset.targetId = 'disabled-tooltip';
	tt.textContent = 'Disabled, should not be seen';
	document.body.appendChild(tt);
});