import { createSuite } from '../../node_modules/just-test/dist/just-test.min.js'
import { tooltip } from '../../dist/tooltip.js';

const suite = createSuite({ name: 'Testing tooltip APIs' });

suite.addTest({ name: 'test A' }, test => {
	const
		divA = document.createElement('div'),
		divB = document.createElement('div'),
		divC = document.createElement('div');

	divA.style.position = 'absolute';
	divA.style.top = '1000px';
	divA.style.left = '100px';
	divA.style.width = '400px';
	divA.style.height = '200px';
	divA.style.overflow = 'auto';
	document.body.appendChild(divA);

	divB.style.position = 'absolute';
	divB.style.top = '400px';
	divB.style.left = '100px';
	divB.style.width = '200px';
	divB.style.height = '100px';
	divB.style.overflow = 'auto';
	divA.appendChild(divB);

	divC.style.position = 'absolute';
	divC.style.top = '200px';
	divC.textContent = 'some thing to call out over';
	divB.appendChild(divC);

	tooltip({
		target: divC,
		content: 'something'
	});

	test.pass();
});

suite.run();