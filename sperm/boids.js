/* Flocking simulation by Taylor White, recovered and repaired November 25, 2026. */
(function (root) {
	"use strict";

	var maxSpeed = 2.5;
	var maxForce = 0.06;

	function limit(x, y, maximum) {
		var length = Math.hypot(x, y);
		var scale = length > maximum ? maximum / length : 1;
		return [x * scale, y * scale];
	}

	function steering(x, y, boid) {
		var length = Math.hypot(x, y);
		// Symmetric neighborhoods can leave a tiny floating-point residual.
		if (length < 1e-10) return [0, 0];
		return limit(x / length * maxSpeed - boid.vx,
			y / length * maxSpeed - boid.vy, maxForce);
	}

	function createBoid(id, x, y, angle) {
		return {
			id: id,
			vx: Math.cos(angle) * 2,
			vy: Math.sin(angle) * 2,
			path: Array.from({ length: 12 }, function () { return [x, y]; }),
			count: 0
		};
	}

	function forces(boid, flock) {
		var sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0;
		var aligned = 0, cohesive = 0;
		flock.forEach(function (other) {
			if (other === boid) return;
			var dx = other.path[0][0] - boid.path[0][0];
			var dy = other.path[0][1] - boid.path[0][1];
			var distance = Math.hypot(dx, dy);
			if (distance < 30) {
				if (distance === 0) {
					// Coincident deposits still need an equal-and-opposite escape direction.
					sx += boid.id < other.id ? -1 : 1;
				} else {
					sx -= dx / (distance * distance);
					sy -= dy / (distance * distance);
				}
			}
			if (distance < 65) {
				ax += other.vx;
				ay += other.vy;
				aligned++;
			}
			if (distance < 100) {
				cx += dx;
				cy += dy;
				cohesive++;
			}
		});
		return {
			separation: steering(sx, sy, boid),
			alignment: aligned ? steering(ax / aligned, ay / aligned, boid) : [0, 0],
			cohesion: cohesive ? steering(cx / cohesive, cy / cohesive, boid) : [0, 0]
		};
	}

	function advanceTail(boid) {
		var x = boid.path[0][0], y = boid.path[0][1];
		var dx = boid.vx, dy = boid.vy;
		var speed = Math.hypot(dx, dy);
		var spacing = 5 + speed / 3;
		boid.count += speed * 10;
		for (var j = 1; j < boid.path.length; j++) {
			var length = Math.hypot(dx, dy);
			var ux = length ? dx / length : 1;
			var uy = length ? dy / length : 0;
			var nextDx = x - boid.path[j][0];
			var nextDy = y - boid.path[j][1];
			var wave = Math.sin((boid.count + j * 30) / 100);
			x -= ux * spacing;
			y -= uy * spacing;
			boid.path[j][0] = x - uy * wave;
			boid.path[j][1] = y + ux * wave;
			dx = nextDx;
			dy = nextDy;
		}
	}

	function step(flock, width, height, flocking) {
		// Every boid observes the same frame, not partially updated neighbors.
		var velocities = flock.map(function (boid) {
			if (!flocking) return limit(boid.vx, boid.vy, maxSpeed);
			var f = forces(boid, flock);
			return limit(
				boid.vx + 1.8 * f.separation[0] + f.alignment[0] + 0.6 * f.cohesion[0],
				boid.vy + 1.8 * f.separation[1] + f.alignment[1] + 0.6 * f.cohesion[1],
				maxSpeed);
		});
		flock.forEach(function (boid, i) {
			boid.vx = velocities[i][0];
			boid.vy = velocities[i][1];
			var x = boid.path[0][0] + boid.vx;
			var y = boid.path[0][1] + boid.vy;
			if (x < 0 || x > width) boid.vx = x < 0 ? Math.abs(boid.vx) : -Math.abs(boid.vx);
			if (y < 0 || y > height) boid.vy = y < 0 ? Math.abs(boid.vy) : -Math.abs(boid.vy);
			boid.path[0][0] = Math.max(0, Math.min(width, x));
			boid.path[0][1] = Math.max(0, Math.min(height, y));
			advanceTail(boid);
		});
	}

	var api = { createBoid: createBoid, forces: forces, step: step };
	if (typeof module !== "undefined" && module.exports) module.exports = api;
	else root.Boids = api;
}(typeof globalThis !== "undefined" ? globalThis : this));
