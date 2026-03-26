import {MeshSurfaceSampler} from "three/examples/jsm/math/MeshSurfaceSampler.js";

export class MapGenerator {

	#mesh;
	#collectiblesAmount;
	#hostilesAmount;

	#_scene;
	#_samplers = [];   // { sampler, mesh, area }
	#_raycaster;
	#_down = new THREE.Vector3(0, -1, 0);

	/**
	 * TODO: rework constructor to accept collectibles {} and hostiles {}
	 * @param mesh
	 * @param collectiblesAmount
	 * @param hostilesAmount
	 */
	constructor(mesh, collectiblesAmount = 3, hostilesAmount = 2) {
		this.#mesh = mesh;
		this.#collectiblesAmount = collectiblesAmount;
		this.#hostilesAmount = hostilesAmount;
		this.#_scene = document.querySelector("a-scene");

		this.#mesh.getObject3D("mesh").traverse((node) => {
			if (node.isMesh && node.geometry) {
				const sampler = new MeshSurfaceSampler(node).build();
				this.#_samplers.push({
					sampler,
					mesh: node,
					area: this.#estimateSurfaceArea(node)
				});
			}
		});

		// normalize weights (surface area)
		const totalArea = this.#_samplers.reduce((sum, s) => sum + s.area, 0);
		this.#_samplers.forEach(s => s.weight = s.area / totalArea);

		this.#_raycaster = new THREE.Raycaster();

		if (this.#_samplers.length === 0) throw new Error("No valid meshes found for sampling.");
	}

	// --- helpers -----------------------------------------------------------------------------------------------------

	// estimate mesh surface area (approximation but will work for now)
	#estimateSurfaceArea(mesh) {
		const geom = mesh.geometry;
		const pos = geom.attributes.position;

		let area = 0;

		for (let i = 0; i < pos.count; i += 3) {
			const a = new THREE.Vector3().fromBufferAttribute(pos, i);
			const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
			const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
			area += b.clone().sub(a).cross(c.clone().sub(a)).length() * 0.5;
		}

		return area;
	}

	// pick sampler weighted by area
	#pickSampler() {
		const r = Math.random();
		let acc = 0;

		for (const s of this.#_samplers) {
			acc += s.weight;
			if (r <= acc) return s;
		}

		return this.#_samplers[0];
	}

	#getRandomPoint() {
		const {sampler, mesh} = this.#pickSampler();

		const position = new THREE.Vector3();
		sampler.sample(position);
		mesh.localToWorld(position);

		// raycast downward to snap to visible surface
		this.#_raycaster.set(position.clone().add(new THREE.Vector3(0, 50, 0)), this.#_down);

		const intersects = this.#_raycaster.intersectObject(
			this.#mesh.getObject3D("mesh"),
			true
		);

		return intersects.length > 0 ? intersects[0].point : position;
	}

	// --- generation --------------------------------------------------------------------------------------------------
	generate() {
		// collectibles
		for (let i = 0; i < this.#collectiblesAmount; i++) {
			const {x, y, z} = this.#getRandomPoint();

			const collectible = document.createElement("a-entity");
			collectible.setAttribute("gltf-model", "#item-pizza");
			collectible.setAttribute("position", `${x} ${y + 0.5} ${z}`);
			collectible.setAttribute("scale", "0.225 0.225 0.225");
			collectible.setAttribute("static-body", "shape: box;");
			collectible.classList.add("grabbable");

			this.#_scene.appendChild(collectible);
		}

		// hostiles
		for (let i = 0; i < this.#hostilesAmount; i++) {
			const {x, y, z} = this.#getRandomPoint();

			const hostileEntity = document.createElement("a-entity");
			hostileEntity.setAttribute("gltf-model", "#npc-einstein");
			hostileEntity.setAttribute("position", `${x} ${y + 0.5} ${z}`);
			hostileEntity.setAttribute("hostile-entity", "");
			hostileEntity.setAttribute("nav-agent", "speed: 2;");

			this.#_scene.appendChild(hostileEntity);
		}
	}
}
