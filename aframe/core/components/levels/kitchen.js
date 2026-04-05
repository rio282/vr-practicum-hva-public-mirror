import {AmbientAudio} from "@/aframe/core/utils/audio-utils";

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

		this.el.appendChild(this.container)

		AmbientAudio.start("#audio-eerie_1", 0.125, false);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
