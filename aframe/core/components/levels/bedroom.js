AFRAME.registerComponent("bedroom", {
	init() {
		this.container = document.createElement("a-entity");

		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-bedroom"
				scale="0.1 0.1 0.1"
				position="0 -2 0"
			></a-entity>
		`;

		this.el.appendChild(this.container);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
