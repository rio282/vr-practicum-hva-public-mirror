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
			<a-entity position="0 5 4">
				<a-spot
					color="#fff8e1"
					intensity="7"
					angle="60"
					penumbra="0.3"
					distance="25"
					rotation="-90 0 0">
				</a-spot>
			</a-entity>

            <a-entity
                id="mom"
                gltf-model="#npc-mom"
                position="-12 -3.5 -3"
                scale="3 3 3">
            </a-entity>

            <a-entity
                id="dad"
                gltf-model="#npc-dad"
                position="9 -3.5 10"
                scale="3 3 3">
            </a-entity>
        `;

		this.el.appendChild(this.container);

		// start eerie audio
		AmbientAudio.start("#audio-eerie_1", 0.125, false);

		// start cutscene after some time
		this.el.sceneEl.addEventListener("loaded", () => setTimeout(() => this.startCutscene(), 3000));
	},

	startCutscene() {
		// emit game cutscene state
		this.el.sceneEl.emit("start-cutscene");

		const mom = this.container.querySelector("#mom");
		const dad = this.container.querySelector("#dad");

		// define start & end positions
		const momTarget = {x: -9, y: -3.5, z: 9};
		const dadTarget = {x: -7, y: -3.5, z: 9};

		// move characters
		this.moveCharacter(mom, momTarget);
		this.moveCharacter(dad, dadTarget);

		// rotate characters to face each other after arriving
		setTimeout(() => this.faceEachOther(mom, dad), 1500);

		// end cutscene after 4 seconds
		setTimeout(() => this.el.sceneEl.emit("end-cutscene"), 5000);
	},

	moveCharacter(character, target) {
		const duration = 3456;
		character.setAttribute("animation", {
			property: "position",
			to: `${target.x} ${target.y} ${target.z}`,
			dur: duration,
			easing: "easeOutQuad"
		});

		character.setAttribute("animation-mixer", {
			clip: character.id === "mom" ? "walking" : "Walking",
			loop: "repeat",
			timeScale: 1,
		});

		setTimeout(() => {
			character.setAttribute("animation-mixer", {
				clip: character.id === "mom" ? "idle" : "Idle",
				loop: "repeat",
				timeScale: 1,
			});
		}, duration);
	},

	faceEachOther(charA, charB) {
		const posA = charA.object3D.position.clone();
		const posB = charB.object3D.position.clone();

		charA.object3D.lookAt(posB);
		charB.object3D.lookAt(posA);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
