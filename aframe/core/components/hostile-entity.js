AFRAME.registerComponent("hostile-entity", {

	ticksPerSecond: 20,

	schema: {
		killableDistance: {type: "number", default: 1},
	},

	init: function () {
		this.player = this.el.sceneEl.querySelector("#player")
		this.playerPos = new THREE.Vector3();
		if (!this.player) throw new Error("Can't find player");
		this.tick = AFRAME.utils.throttleTick(this.tick, 1 / this.ticksPerSecond * 1000, this);
	},

	tick: function () {
		this.player.object3D.getWorldPosition(this.playerPos);
		this.el.setAttribute("nav-agent", {
			active: true,
			destination: {
				x: this.playerPos.x,
				y: this.playerPos.y,
				z: this.playerPos.z,
			}
		});

		const distance = this.el.object3D.position.distanceTo(this.player.object3D.position);
		if (distance <= this.data.killableDistance) this.killPlayer();
	},

	killPlayer() {
		this.el.sceneEl.emit("game-over");
	},

});
