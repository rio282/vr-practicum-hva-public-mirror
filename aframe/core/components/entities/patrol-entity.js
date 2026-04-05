AFRAME.registerComponent("patrol-entity", {
	schema: {
		pointA: {type: "vec3", default: {x: -2, y: 0, z: 0}},
		pointB: {type: "vec3", default: {x: 2, y: 0, z: 0}},
		speed: {default: 2} // units per second
	},

	init() {
		this.target = new THREE.Vector3(
			this.data.pointB.x,
			this.data.pointB.y,
			this.data.pointB.z
		);

		this.pos = new THREE.Vector3();
	},

	tick(time, delta) {
		const el = this.el;
		el.object3D.getWorldPosition(this.pos);

		const target = this.target;
		const dir = target.clone().sub(this.pos);
		const distance = dir.length();

		// reached target → switch direction
		if (distance < 0.1) {
			if (target.equals(new THREE.Vector3(this.data.pointA.x, this.data.pointA.y, this.data.pointA.z)))
				this.target.set(this.data.pointB.x, this.data.pointB.y, this.data.pointB.z);
			else
				this.target.set(this.data.pointA.x, this.data.pointA.y, this.data.pointA.z);

			return;
		}

		dir.normalize();

		// movement step
		const moveStep = (this.data.speed * delta) / 1000;
		this.pos.add(dir.multiplyScalar(moveStep));

		// apply position & rotate correctly
		el.object3D.position.copy(this.pos);
		el.object3D.lookAt(this.target);
	}
});
