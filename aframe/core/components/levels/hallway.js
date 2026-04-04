AFRAME.registerComponent("hallway", {
	init() {
		this.container = document.createElement("a-entity");
		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-hallway"
				scale="0.33 0.5 0.33"
				position="0 1.25 0">
			</a-entity>

			<a-entity
				position="0 1 -5"
				geometry="primitive: box"
				material="color: red"
				data-level="bedroom"
				class="level-trigger">
			</a-entity>

			<a-entity
				position="3 1 -5"
				geometry="primitive: box"
				material="color: blue"
				data-level="kitchen"
				class="level-trigger">
			</a-entity>
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
