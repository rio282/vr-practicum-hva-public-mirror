AFRAME.registerComponent("hostile-entity", {

	init: function () {
		this.player = this.el.sceneEl.querySelector("#player");
		if (!this.player) throw new Error("Can't find player");
	},

	tick: function () {
		const playerPos = new THREE.Vector3();
		player.object3D.getWorldPosition(playerPos);

		// this.el.setAttribute("nav-agent", {
		// 	active: true,
		// 	destination: {
		// 		x: playerPos.x,
		// 		y: playerPos.y,
		// 		z: playerPos.z,
		// 	}
		// });
	},

});
