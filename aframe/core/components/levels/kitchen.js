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
		this.el.sceneEl.emit("start-cutscene");

		const mom = this.container.querySelector("#mom");
		const dad = this.container.querySelector("#dad");

		// define stages
		const stages = [
			async () => {
				// stage 1: mom moves
				await this.moveCharacter(mom, {x: -9, y: -3.5, z: 9}, "walking", "idle", 2000);
				await this.moveCharacter(dad, {x: -7, y: -3.5, z: 9}, "Walking", "Idle", 2000);
				this.faceEachOther(mom, dad);
			},
			async () => {
				// stage 2: wait a little
				await this.delay(1000);
			},
			async () => {
				// stage 3: start talking
			},
			async () => {
				// stage 4: crashout
			},
			async () => {
				// stage 5: dad storms out
			},
			async () => {
				// stage 6: mom says its all *YOUR* fault
			},
			async () => {
				// stage 7: mom walks out
			},
			async () => {
				// stage 8: player takes control again, we grab our bag and leave
			},
		];

		this.runStagesSequentially(stages).then(() => this.el.sceneEl.emit("end-cutscene"));
	},

	async moveCharacter(character, target, walkClip, idleClip, duration = 3456) {
		return new Promise(resolve => {
			// move position
			character.setAttribute("animation", {
				property: "position",
				to: `${target.x} ${target.y} ${target.z}`,
				dur: duration,
				easing: "easeOutQuad"
			});

			// play walking animation
			character.setAttribute("animation-mixer", {
				clip: walkClip,
				loop: "repeat",
				timeScale: 1
			});

			// after movement finishes, switch to idle
			setTimeout(() => {
				character.setAttribute("animation-mixer", {
					clip: idleClip,
					loop: "repeat",
					timeScale: 1
				});
				resolve();
			}, duration);
		});
	},

	async runStagesSequentially(stages) {
		for (const stage of stages) await stage();
	},

	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
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
