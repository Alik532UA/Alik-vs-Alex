/**
 * Префікси сховища для ізоляції даних (STORAGE-NAMESPACE-v10 § 1).
 */
export const STORAGE_PREFIX =
	typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
		? 'alikvsalex-dev_'
		: 'alikvsalex_';
