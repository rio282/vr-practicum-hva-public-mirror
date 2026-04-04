AFRAME.registerComponent("bedroom", {
	init() {
		this.container = document.createElement("a-entity");

		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-bedroom"
				scale="7 7 7"
				position="0 6 0"
			></a-entity>
		`;

		this.el.appendChild(this.container);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
