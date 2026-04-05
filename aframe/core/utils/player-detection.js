/**
 * Returns true if the entity is within `radius` of the player.
 * @param {AFRAME.Entity} entity - The entity to check.
 * @param {AFRAME.Entity} player - The player entity.
 * @param {number} radius - Distance threshold.
 */
export function isPlayerNearby(entity, player, radius = 1) {
	if (!entity || !player) throw TypeError("Both the entity and player must exist.");

	const entityPos = new THREE.Vector3();
	const playerPos = new THREE.Vector3();

	entity.object3D.getWorldPosition(entityPos);
	player.object3D.getWorldPosition(playerPos);

	entityPos.y = 0;
	playerPos.y = 0;

	return entityPos.distanceTo(playerPos) <= radius;
}

/**
 * Checks if the player is the exact bounds of the entity (x, z only)
 * @param entity
 * @param player
 */
export function isPlayerInBounds(entity, player) {
	if (!entity || !player) throw TypeError("Both the entity and player must exist.");

	const box = new THREE.Box3().setFromObject(entity.object3D);
	const playerPos = new THREE.Vector3();

	player.object3D.getWorldPosition(playerPos);

	playerPos.y = box.min.y;

	return box.containsPoint(playerPos);
}
