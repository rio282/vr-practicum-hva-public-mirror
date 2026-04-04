AFRAME.registerComponent("light-jitter", {
	schema: {
		rotAmount: {default: 0.001},
		flickerSpeed: {default: 500000},
		intensityVar: {default: 0.25},
		angleVar: {default: 0.05},
		distanceVar: {default: 0.25}
	},

	init: function () {
		this.baseRotation = this.el.object3D.rotation.clone();

		const light = this.el.getAttribute("light");
		this.baseIntensity = light.intensity || 3;
		this.baseAngle = light.angle || 20;
		this.baseDistance = light.distance || 20;
	},

	tick: function (time) {
		const obj = this.el.object3D;

		obj.rotation.x = this.baseRotation.x + Math.sin(time / 300) * this.data.rotAmount;
		obj.rotation.y = this.baseRotation.y + Math.cos(time / 400) * this.data.rotAmount;

		const flicker = Math.sin(time / this.data.flickerSpeed);

		const intensity =
			this.baseIntensity +
			flicker * this.data.intensityVar +
			(Math.random() - 0.5) * 0.2;

		const angle =
			this.baseAngle +
			Math.sin(time / 500) * this.data.angleVar;

		const distance =
			this.baseDistance +
			Math.cos(time / 600) * this.data.distanceVar;

		this.el.setAttribute("light", {
			intensity: intensity,
			angle: angle,
			distance: distance
		});
	}
});
