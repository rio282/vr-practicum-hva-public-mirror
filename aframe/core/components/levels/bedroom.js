AFRAME.registerComponent("bedroom", {
	init() {
		this.container = document.createElement("a-entity");

		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-bedroom"
				scale="7 7 7"
				position="0 6 0"
			></a-entity>

			<a-box
				position="11.89 0.85 17.67"
				width="1.75"
				height="0.05"
				depth="5.67"
				geometry="primitive: box"
				material="color: red;"
				class="safe-zone final-safe-zone">
			</a-box>
		`;

		this.el.appendChild(this.container);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
