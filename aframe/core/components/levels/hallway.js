AFRAME.registerComponent("hallway", {
	init() {
		this.container = document.createElement("a-entity");
		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-hallway"
				scale="0.33 0.5 0.33"
				position="0 1.25 0">
			</a-entity>

			<a-box
				position="1 -3 16"
				width="7"
				height="0.05"
				depth="5"
				geometry="primitive: box"
				material="color: red;"
				data-level="bedroom"
				class="level-trigger">
			</a-box>

			<a-box
				position="1 -3 -27"
				width="7"
				height="0.05"
				depth="5"
				material="color: blue;"
				data-level="kitchen"
				class="level-trigger">
			</a-box>
		`;

		this.container
			.querySelectorAll(".level-trigger")
			.forEach(lt => lt.addEventListener("click", () => this.onChangeLevel(lt.getAttribute("data-level"))));

		this.el.appendChild(this.container);
	},

	onChangeLevel(level) {
		this.el.sceneEl.emit("change-level", {level});
	},

	remove() {
		// cleanup listeners + DOM
		if (this.container) {
			const trigger = this.container.querySelector(".level-trigger");
			if (trigger) trigger.removeEventListener("click", this.onChangeLevel);
			this.container.remove();
		}
	}
});
