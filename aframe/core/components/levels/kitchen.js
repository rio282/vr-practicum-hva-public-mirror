AFRAME.registerComponent("kitchen", {
	init() {
		this.container = document.createElement("a-entity");

		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-kitchen"
				scale="0.1 0.1 0.1"
				position="0 -3.5 0"
			></a-entity>
		`;

		this.el.appendChild(this.container);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
