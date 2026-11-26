/*
 * Taylor White's Flocking With Sperm, recovered from:
 * https://gist.github.com/taylorchasewhite/f5ede58351f8e7e5e3cd31cfc1ce2e7e
 * Head/tail visualization based on Mike Bostock's Spermatozoa:
 * https://gist.github.com/mbostock/1136236
 */
/* global d3, Boids */
(function () {
	"use strict";

	var width = 960, height = 500, nextId = 0;
	var flocking = document.body.dataset.flocking !== "false" &&
		new URLSearchParams(location.search).get("mode") !== "swimming";
	var settings = Object.assign({}, Boids.defaults);
	var controls = [
		["separationWeight", "Separation strength", 0, 4, 0.1, "Avoid crowding"],
		["alignmentWeight", "Alignment strength", 0, 4, 0.1, "Match nearby headings"],
		["cohesionWeight", "Cohesion strength", 0, 4, 0.1, "Gather with neighbors"],
		["separationRadius", "Separation radius", 0, 200, 5, "Simulation pixels"],
		["alignmentRadius", "Alignment radius", 0, 200, 5, "Simulation pixels"],
		["cohesionRadius", "Cohesion radius", 0, 200, 5, "Simulation pixels"],
		["maxSpeed", "Maximum speed", 0.5, 6, 0.1, "Pixels per simulation step"],
		["maxForce", "Steering force", 0.01, 0.3, 0.01, "Turning acceleration per rule"]
	];
	var controlInputs = [];
	if (flocking) {
		d3.select("#controls").property("hidden", false);
		controls.forEach(function (control, index) {
			var key = control[0];
			var row = d3.select(index < 3 ? "#strengths" : "#advanced").append("div").attr("class", "control");
			row.append("label").attr("for", key).text(control[1]);
			var output = row.append("output").attr("for", key);
			var input = row.append("input").attr("type", "range").attr("id", key)
				.attr("min", control[2]).attr("max", control[3]).attr("step", control[4])
				.attr("aria-describedby", key + "-help");
			row.append("small").attr("id", key + "-help").text(control[5]);
			function display() {
				input.property("value", settings[key]);
				output.text(settings[key]);
			}
			input.on("input", function () {
				var value = this.valueAsNumber;
				if (!Number.isFinite(value) || value < control[2] || value > control[3]) {
					throw new RangeError("Invalid flocking setting: " + key);
				}
				settings[key] = value;
				display();
			});
			controlInputs.push(display);
			display();
		});
		d3.select("#btnReset").on("click", function () {
			Object.assign(settings, Boids.defaults);
			controlInputs.forEach(function (display) { display(); });
		});
	}
	var flock = d3.range(100).map(function () {
		return Boids.createBoid(nextId++, Math.random() * width,
			Math.random() * height, Math.random() * Math.PI * 2);
	});
	var svg = d3.select("#simulation").append("svg")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("role", "img")
		.attr("aria-label", flocking ? "Sperm swimming with boids flocking" : "Sperm swimming without flocking");
	var groups;

	function join() {
		groups = svg.selectAll("g").data(flock, function (d) { return d.id; });
		groups.exit().remove();
		var entered = groups.enter().append("g");
		entered.append("ellipse").attr("rx", 6.5).attr("ry", 4);
		entered.append("path").attr("class", "mid");
		entered.append("path").attr("class", "tail");
		groups = svg.selectAll("g");
		d3.select("#population").text(flock.length + (flock.length === 1 ? " swimmer" : " swimmers"));
		d3.select("#btnRemove").property("disabled", flock.length === 0);
		render();
	}

	function render() {
		groups.select("ellipse").attr("transform", function (d) {
			return "translate(" + d.path[0] + ")rotate(" +
				Math.atan2(d.vy, d.vx) * 180 / Math.PI + ")";
		});
		groups.select(".mid").attr("d", function (d) { return "M" + d.path.slice(0, 3).join("L"); });
		groups.select(".tail").attr("d", function (d) { return "M" + d.path.join("L"); });
	}

	d3.select("#btnAdd").on("click", function () {
		flock.push(Boids.createBoid(nextId++, width / 2, height / 2, Math.random() * Math.PI * 2));
		join();
	});
	d3.select("#btnRemove").on("click", function () {
		flock.pop();
		join();
	});
	join();

	var previous = 0, accumulated = 0, interval = 1000 / 60;
	d3.timer(function (elapsed) {
		// Fixed-rate physics avoids changing flock behavior on high-refresh displays.
		accumulated += Math.min(elapsed - previous, interval * 5);
		previous = elapsed;
		while (accumulated >= interval) {
			Boids.step(flock, width, height, flocking, settings);
			accumulated -= interval;
		}
		render();
	});
}());
