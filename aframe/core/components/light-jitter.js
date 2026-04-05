AFRAME.registerComponent("light-jitter", {
	schema: {
		rotAmount: {default: 0.001},
		flickerSpeed: {default: 500},
		intensityVar: {default: 0.25},
		angleVar: {default: 0.05},
		distanceVar: {default: 0.25},
		lerpSpeed: {default: 0.0567}
	},

	init: function () {
		this.baseRotation = this.el.object3D.rotation.clone();

		const light = this.el.getAttribute("light");

		// current (what we render)
		this.current = {
			intensity: light.intensity || 3,
			angle: light.angle || 20,
			distance: light.distance || 20
		};

		// target (what we move toward)
		this.target = {...this.current};

		this.el.sceneEl.addEventListener("update-player-light-base-values", (e) => {
			const newLight = e.detail;

			this.target.intensity = newLight.intensity ?? this.target.intensity;
			this.target.angle = newLight.angle ?? this.target.angle;
			this.target.distance = newLight.distance ?? this.target.distance;
		});
	},

	tick: function (time) {
		const obj = this.el.object3D;

		// rotation jitter
		obj.rotation.x = this.baseRotation.x + Math.sin(time / 300) * this.data.rotAmount;
		obj.rotation.y = this.baseRotation.y + Math.cos(time / 400) * this.data.rotAmount;

		const lerp = this.data.lerpSpeed;
		this.current.intensity += (this.target.intensity - this.current.intensity) * lerp;
		this.current.angle += (this.target.angle - this.current.angle) * lerp;
		this.current.distance += (this.target.distance - this.current.distance) * lerp;

		// flicker on top
		const flicker = Math.sin(time / this.data.flickerSpeed);

		const intensity = this.current.intensity + flicker * this.data.intensityVar + (Math.random() - 0.5) * 0.2;
		const angle = this.current.angle + Math.sin(time / 500) * this.data.angleVar;
		const distance = this.current.distance + Math.cos(time / 600) * this.data.distanceVar;

		this.el.setAttribute("light", {
			intensity,
			angle,
			distance
		});
	}
});
