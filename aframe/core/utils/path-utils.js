export const _m_context = require.context(
	"@/aframe/assets/models",
	true,
	/\.(glb|gltf|obj)$/
);

export const _a_context = require.context(
	"@/aframe/assets/audio",
	true,
	/\.(mp3|wav|ogg)$/
);

/**
 * Retrieves model files from a given folder using Webpack's require.context.
 *
 * @param {string} [folder=""] - Subfolder of "models" folder to search in.
 * @returns {{ filename: string, src: string, id: string }[]}
 * An array of model descriptors:
 * - filename: relative file path (without "./")
 * - src: resolved module path (usable as asset source)
 * - id: normalized ID (prefixed with '#', safe for DOM/A-Frame usage)
 */
export function getFilesFromFolder(folder = "", ctx = _m_context) {
	const removeFileExtension = (filename) => {
		const lastDotIndex = filename.lastIndexOf('.');
		return lastDotIndex <= 0 ? filename : filename.slice(0, lastDotIndex);
	};

	/**
	 * Normalizes a file path into a safe ID string:
	 * - removes leading "./"
	 * - removes file extension
	 * - replaces path separators with "-"
	 *
	 * @param {string} path - Relative file path returned by `require.context` (e.g. "./folder/model.glb")
	 * @returns {string} Normalized ID string without '#' prefix (e.g. "folder-model")
	 */
	const normalizeId = (path) =>
		removeFileExtension(path)
			.replace(/^\.\//, "")
			.replace(/[\/\\]/g, "-");

	return ctx.keys()
		.filter((path) => {
			if (!folder) return true;
			const normalizedFolder = folder.replace(/^\/|\/$/g, "");
			return path.startsWith(`./${normalizedFolder}/`) || path === `./${normalizedFolder}`;
		})
		.map((path) => ({
			filename: path.replace("./", ""),
			src: ctx(path),
			id: `#${normalizeId(path)}`
		}));
}
