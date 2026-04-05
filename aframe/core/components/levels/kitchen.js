import {AmbientAudio} from "@/aframe/core/utils/audio-utils";

AFRAME.registerComponent("kitchen", {
	init() {
		this.container = document.createElement("a-entity");

		// main kitchen environment
		this.container.innerHTML = `
            <a-entity
                gltf-model="#environment-kitchen"
                scale="0.1 0.1 0.1"
                position="0 -3.5 0"
            ></a-entity>

            <!-- Characters -->
            <a-entity id="char-left" gltf-model="#mom" position="-1 0 0"></a-entity>
            <a-entity id="char-right" gltf-model="#dad" position="1 0 0"></a-entity>
        `;

		this.el.appendChild(this.container);

		// start eerie audio
		AmbientAudio.start("#audio-eerie_1", 0.125, false);

		// start cutscene after 1 second
		setTimeout(() => this.startCutscene(), 1000);
	},

	startCutscene() {
		// emit game cutscene state
		this.el.sceneEl.emit("start-cutscene");

		// move both characters to the middle
		const middlePosition = {x: 0, y: 0, z: 0};

		this.container.querySelector("#char-left").setAttribute("animation", {
			property: "position",
			to: `${middlePosition.x - 1} ${middlePosition.y} ${middlePosition.z}`,
			dur: 2000,
			easing: "easeInOutQuad"
		});

		this.container.querySelector("#char-right").setAttribute("animation", {
			property: "position",
			to: `${middlePosition.x + 1} ${middlePosition.y} ${middlePosition.z}`,
			dur: 2000,
			easing: "easeInOutQuad"
		});

		// optional: end cutscene automatically after 3 seconds
		setTimeout(() => {
			this.el.sceneEl.emit("end-cutscene");
		}, 3000);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
