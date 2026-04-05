import {AmbientAudio, speakText, getVoice} from "@/aframe/core/utils/audio-utils";
import {isPlayerNearby} from "@/aframe/core/utils/player-detection";

AFRAME.registerComponent("kitchen", {
	init() {
		this.player = this.el.sceneEl.querySelector("#player");

		this.container = document.createElement("a-entity");
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
			<a-box
                position="-2 -3.5 2"
                width="24"
                height="0.05"
                depth="24"
                static-body
                nav-mesh
                visible="false">
			</a-box>

			<a-box
                position="-13.5 -3.5 -2.5"
                width="1"
                height="0.05"
                depth="4"
                class="level-trigger">
            </a-box>
			<a-box
                position="9.5 -3.5 10"
                width="1"
                height="0.05"
                depth="4"
                class="level-trigger">
            </a-box>

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

			<a-entity
                id="bag"
                gltf-model="#item-bag"
                position="-8.7 -3.5 -7"
                scale="0.2 0.2 0.2"
                dynamic-body="shape: box;"
                mouse-drag
                grabbable
                class="grabbable">
            </a-entity>
        `;

		this.el.appendChild(this.container);

		// start eerie audio
		AmbientAudio.start("#audio-eerie_1", 0.125, false);

		// start cutscene after some time
		this.onLevelLoaded = (e) => {
			if (e.detail.level !== "kitchen") return;
			setTimeout(() => this.startCutscene(), 3000);
		};
		this.el.sceneEl.addEventListener("level-loaded", this.onLevelLoaded);
	},

	tick: function () {
		this.container
			.querySelectorAll(".level-trigger")
			.forEach(lt => {
				if (isPlayerNearby(lt, this.player, 1.5)) {
					this.el.sceneEl.emit("change-level", {level: "forest"});
					this.el.sceneEl.emit("game-completed");
				}
			});
	},

	startCutscene() {
		this.el.sceneEl.emit("start-cutscene");
		this.el.sceneEl.emit("set-instruction", {value: "Remain calm."});

		const mom = this.container.querySelector("#mom");
		const dad = this.container.querySelector("#dad");

		const stages = [
			async () => {
				await this.delay(1567);
			},
			async () => {
				const walkingTime = 3456;
				this.faceEachOther(mom, dad);

				this.moveCharacter(mom, {x: -9, y: -3.5, z: 9}, "walking", "idle", walkingTime);
				this.moveCharacter(dad, {x: -7, y: -3.5, z: 9}, "Walking", "Idle", walkingTime);

				await this.delay(walkingTime);
				this.faceEachOther(mom, dad);
			},
			async () => {
				await this.delay(1000);
			},
			async () => {
				await speakText("You need to listen to me!", {
					rate: 0.9,
					pitch: 1.1,
					volume: 1,
					voice: getVoice("English")
				});

				await speakText("I can't believe this is happening!", {
					rate: 0.95,
					pitch: 0.67,
					voice: getVoice("English")
				});
			},
			async () => {
				await speakText("You never listen! You never do!", {
					rate: 1.05,
					pitch: 1.1
				});

				await speakText("Don't turn this on me again!", {
					rate: 1.0,
					pitch: 0.6
				});
			},
			async () => {
				await speakText("I'm done. I'm not doing this anymore.", {
					rate: 0.9,
					pitch: 0.6
				});

				await this.moveCharacter(
					dad,
					{x: 15, y: -3.5, z: 20},
					"Walking",
					"Idle",
					2500
				);
			},
			async () => {
				this.faceEachOther(mom, this.player);

				await speakText("This is your fault.", {
					rate: 0.8,
					pitch: 0.9
				});

				await speakText("Do you hear me?", {
					rate: 0.75,
					pitch: 0.85
				});

				await speakText("Your fault.", {
					rate: 0.80,
					pitch: 0.80,
					volume: 2.0
				});
			},
			async () => {
				await this.moveCharacter(
					mom,
					{x: -15, y: -3.5, z: 20},
					"walking",
					"idle",
					2500
				);
			},
			async () => {
				await this.delay(1500);
				AmbientAudio.setVolume(AmbientAudio.getVolume() / 2);
				this.el.sceneEl.emit("set-instruction", {value: "Grab your bag and go outside"});
			}
		];

		this.runStagesSequentially(stages).then(() => this.el.sceneEl.emit("end-cutscene"));
	},

	async moveCharacter(character, target, walkClip, idleClip, duration = 3000) {
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
		if (charB.id !== "player") charB.object3D.lookAt(posA);
	},

	remove() {
		if (this.container) this.container.remove();
		this.el.sceneEl.emit("clear-instruction");
	}
});
