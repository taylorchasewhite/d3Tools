const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createBoid, forces, step } = require("./boids.js");

test("separation repels close neighbors, including coincident deposits", () => {
	const a = createBoid(0, 100, 100, Math.PI / 2);
	const b = createBoid(1, 110, 100, Math.PI / 2);
	assert.ok(forces(a, [a, b]).separation[0] < 0);
	b.path[0][0] = 100;
	assert.ok(forces(a, [a, b]).separation[0] < 0);
	assert.ok(forces(b, [a, b]).separation[0] > 0);
});

test("alignment follows neighbors and cohesion seeks their relative position", () => {
	const a = createBoid(0, 100, 100, 0);
	const b = createBoid(1, 150, 100, Math.PI / 2);
	const f = forces(a, [a, b]);
	assert.ok(f.alignment[0] < 0 && f.alignment[1] > 0);
	assert.ok(f.cohesion[0] > 0);
	assert.equal(f.cohesion[1], 0);
	a.path[0][0] += 500;
	b.path[0][0] += 500;
	assert.deepEqual(forces(a, [a, b]), f, "steering must not depend on world origin");
	assert.deepEqual(forces(a, [a]), { separation: [0, 0], alignment: [0, 0], cohesion: [0, 0] });
});

test("physics is independent of iteration order and keeps a bounded finite flock", () => {
	const flock = Array.from({ length: 30 }, (_, i) =>
		createBoid(i, 400 + (i % 6) * 15, 200 + Math.floor(i / 6) * 15, i * 2.4));
	const reversed = structuredClone(flock).reverse();
	step(flock, 960, 500, true);
	step(reversed, 960, 500, true);
	flock.forEach((b, i) => {
		const other = reversed[reversed.length - 1 - i];
		assert.ok(Math.abs(b.vx - other.vx) < 1e-12);
		assert.ok(Math.abs(b.vy - other.vy) < 1e-12);
	});
	for (let t = 0; t < 1200; t++) {
		step(flock, 960, 500, true);
		for (const b of flock) {
			assert.ok(Math.hypot(b.vx, b.vy) <= 2.5 + 1e-12);
			assert.ok(b.path.flat().every(Number.isFinite));
			assert.ok(b.path[0][0] >= 0 && b.path[0][0] <= 960);
			assert.ok(b.path[0][1] >= 0 && b.path[0][1] <= 500);
		}
	}
});

test("nearby headings converge rather than retaining their original velocities", () => {
	const flock = [
		createBoid(0, 1000, 1000, -0.5),
		createBoid(1, 1040, 1000, 0.5),
		createBoid(2, 1020, 1040, 0)
	];
	function alignment() {
		return Math.hypot(
			...["vx", "vy"].map(axis => flock.reduce((sum, b) =>
				sum + b[axis] / Math.hypot(b.vx, b.vy), 0) / flock.length));
	}
	const before = alignment();
	for (let t = 0; t < 180; t++) step(flock, 10000, 10000, true);
	assert.ok(alignment() > 0.98, "headings should agree to within a tight flock");
	assert.ok(alignment() > before);
});

test("wall reflection, zero speed, empty flocks and unflocked swimming stay valid", () => {
	const b = createBoid(0, 959, 499, Math.PI / 4);
	step([b], 960, 500, false);
	assert.ok(b.vx < 0 && b.vy < 0);
	b.vx = b.vy = 0;
	step([b], 960, 500, true);
	assert.ok(b.path.flat().every(Number.isFinite));
	step([], 960, 500, true);
	const a = createBoid(1, 200, 200, 0);
	const neighbor = createBoid(2, 201, 200, Math.PI);
	step([a, neighbor], 960, 500, false);
	assert.equal(a.vx, 2);
	assert.equal(a.path[0][0], 202);
});
