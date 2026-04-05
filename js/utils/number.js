/**
 * Random number between min and max.
 * @param min - inclusive
 * @param max - exclusive
 * @returns {*}
 */
export function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
