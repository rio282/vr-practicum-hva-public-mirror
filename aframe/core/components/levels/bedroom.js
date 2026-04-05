import {getRandomNumber} from "@/js/utils/number";
import {isPlayerInBounds, isPlayerNearby} from "@/aframe/core/utils/player-detection";
import {AmbientAudio} from "@/aframe/core/utils/audio-utils";
import {DEBUG_MODE} from "@/aframe/settings";

AFRAME.registerComponent("bedroom", {
	defaultAudioVolume: 0.175,
	audioRelaxFactor: 0.2,  // lower is better
	lightRelaxFactor: 1.1,  // higher is better

	guideLineColor: "#00EE00",

	init() {
		// environment setup
		this.player = this.el.sceneEl.querySelector("#player");
		this.playerLight = this.player.querySelector("#playerLight");
		this.defaultLight = {...this.playerLight?.getAttribute("light")};

		this.container = document.createElement("a-entity");
		this.container.innerHTML = `
			<a-entity
				gltf-model="#environment-bedroom"
				scale="7 7 7"
				position="0 6 0"
			></a-entity>

			<!-- safe zones -->
			<a-box
				data-zone-order="0"
				position="-12.1 0.85 -2.8"
				width="7.33"
				height="0.05"
				depth="16"
				geometry="primitive: box"
				material="color: red;"
				visible="${DEBUG_MODE}"
				class="safe-zone">
			</a-box>

			<a-box
				data-zone-order="1"
				position="-15 0.85 17"
				width="1.7"
				height="0.05"
				depth="4.5"
				geometry="primitive: box"
				material="color: red;"
				visible="${DEBUG_MODE}"
				class="safe-zone">
			</a-box>

			<a-box
				data-zone-order="2"
				position="11.89 0.85 17.67"
				width="1.75"
				height="0.05"
				depth="5.67"
				geometry="primitive: box"
				material="color: red;"
				visible="${DEBUG_MODE}"
				class="safe-zone">
			</a-box>

			<!-- npcs -->
			<a-entity entity-container></a-entity>
		`;

		const patrolPositions = [
			{from: {x: 0, z: -12}, to: {x: 0, z: 20}},
			{from: {x: -17, z: 7}, to: {x: 0, z: 7}},
			{from: {x: 13, z: -12}, to: {x: -12, z: 21}},
			{from: {x: -7, z: 21}, to: {x: -7, z: -12}},
			{from: {x: 10, z: 8}, to: {x: 10, z: 22}},
		];
		patrolPositions.forEach(pos => {
			const patrolEntity = document.createElement("a-entity");
			patrolEntity.setAttribute("gltf-model", "#npc-spider");
			patrolEntity.setAttribute("position", `${pos.from.x} 1 ${pos.from.z}`);
			patrolEntity.setAttribute("animation-mixer", {
				clip: "Armature|Walk-Cycle-Run",
				loop: "repeat",
				timeScale: 1
			});
			patrolEntity.setAttribute("patrol-entity", {
				pointA: `${pos.from.x} 1 ${pos.from.z}`,
				pointB: `${pos.to.x} 1 ${pos.to.z}`,
				speed: getRandomNumber(5, 10),
			});
			this.container.querySelector("[entity-container]").appendChild(patrolEntity);
		});

		this.el.appendChild(this.container);

		this.safeZoneLine = document.createElement("a-entity");
		this.safeZoneLine.setAttribute("line", {
			start: "0 0 0",
			end: "0 0 0",
			color: this.guideLineColor,
			opacity: 0.5
		});
		this.container.appendChild(this.safeZoneLine);

		AmbientAudio.start(`#audio-parent_arguing_${getRandomNumber(1, 3)}`, this.defaultAudioVolume);

		// vars
		this.lastSafeZone = this.container.querySelector(`[data-zone-order="0"]`);

		// set tick rate
		this.tick = AFRAME.utils.throttleTick(this.tick, 1 / 20 * 1000, this);
	},

	tick: function () {
		let wasInSafeZone = this.isInSafeZone;
		let isInSafeZone = false;

		const safeZones = Array.from(this.container.querySelectorAll(".safe-zone"))
			.sort((a, b) => a.dataset.zoneOrder - b.dataset.zoneOrder);

		// check safe zone stuff
		safeZones.forEach(sz => {
			if (isPlayerInBounds(sz, this.player)) {
				this.lastSafeZone = sz;
				isInSafeZone = true;
			}
		});

		// only trigger on change
		if (wasInSafeZone !== isInSafeZone) {
			this.isInSafeZone = isInSafeZone;

			if (isInSafeZone) this.onEnterSafeZone();
			else this.onExitSafeZone();
		}

		// draw line to next safe zone
		const next = safeZones.find(z => parseInt(z.dataset.zoneOrder) > (this.lastSafeZone?.dataset.zoneOrder || -1)) || false;  // its (5 am and i dont know anymore bruh)
		if (next) {
			this.safeZoneLine.setAttribute("line", {
				start: `${this.player.object3D.position.x} 1 ${this.player.object3D.position.z}`,
				end: `${next.object3D.position.x} 1 ${next.object3D.position.z}`,
				color: this.guideLineColor,
				opacity: 0.5
			});
		} else this.el.sceneEl.emit("game-won");

		// check entity stuff
		this.container.querySelectorAll("[patrol-entity]").forEach(pe => {
			if (isPlayerNearby(pe, this.player, 1.5)) this.el.sceneEl.emit("game-over");
		});
	},

	onEnterSafeZone() {
		AmbientAudio.setVolume(this.defaultAudioVolume * this.audioRelaxFactor);

		if (!this.playerLight) return;

		let light = this.playerLight.getAttribute("light");
		light.intensity = this.defaultLight.intensity * (this.lightRelaxFactor * 2.22);
		light.angle = this.defaultLight.angle * this.lightRelaxFactor;
		light.distance = this.defaultLight.distance * (this.lightRelaxFactor * 2);

		this.el.sceneEl.emit("update-player-light-base-values", light);
	},

	onExitSafeZone() {
		AmbientAudio.setVolume(this.defaultAudioVolume);
		this.el.sceneEl.emit("update-player-light-base-values", this.defaultLight);
	},

	remove() {
		if (this.container) this.container.remove();
	}
});
