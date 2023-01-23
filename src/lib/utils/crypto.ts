async function getKeyMaterial(password) {
	const enc = new TextEncoder();
	const km = await window.crypto.subtle.importKey(
		'raw',
		enc.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey']
	);
	return km;
}

async function getKey(keyMaterial, salt) {
	const enc = new TextEncoder();
	const saltBuff = enc.encode(salt);
	const key = await window.crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: saltBuff,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-KW', length: 256 },
		true,
		['wrapKey', 'unwrapKey']
	);
	return key;
}

async function wrapCryptoKey(keyToWrap, salt, password) {
	const keyMaterial = await getKeyMaterial(password);
	const wrappingKey = await getKey(keyMaterial, salt);
	const wrappedKey = await window.crypto.subtle.wrapKey('raw', keyToWrap, wrappingKey, 'AES-KW');
	return wrappedKey;
}

export const generateAndWrapKey = async (salt, password) => {
	const key = await window.crypto.subtle.generateKey(
		{
			name: 'AES-GCM',
			length: 256
		},
		true,
		['encrypt', 'decrypt']
	);
	const wrappedKey = await wrapCryptoKey(key, salt, password);
	return bufferToString(wrappedKey);
};

async function getUnwrappingKey(salt, password) {
	const enc = new TextEncoder();
	const keyMaterial = await getKeyMaterial(password);
	const saltBuffer = enc.encode(salt);
	const derivedKey = await window.crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: saltBuffer,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-KW', length: 256 },
		true,
		['wrapKey', 'unwrapKey']
	);
	return derivedKey;
}

export async function unwrapSecretKey(wrappedKey, salt, password) {
	const unwrappingKey = await getUnwrappingKey(salt, password);
	const wrappedKeyBuffer = stringToUint8Array(wrappedKey); //= enc.encode(wrappedKey);
	const unwrappedKey = await window.crypto.subtle.unwrapKey(
		'raw', // import format
		wrappedKeyBuffer, // ArrayBuffer representing key to unwrap
		unwrappingKey, // CryptoKey representing key encryption key
		'AES-KW', // algorithm identifier for key encryption key
		'AES-GCM', // algorithm identifier for key to unwrap
		true, // extractability of key to unwrap
		['encrypt', 'decrypt'] // key usages for key to unwrap
	);
	return unwrappedKey;
}

function bufferToString(buf) {
	return String.fromCharCode(...new Uint8Array(buf));
}

function stringToUint8Array(str) {
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return bufView;
}

export const encrypt = async (message, key) => {
	const enc = new TextEncoder();
	const encoded = enc.encode(message);
	const iv = await window.crypto.getRandomValues(new Uint8Array(12));
	const encryptedMessage = await window.crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: iv },
		key,
		encoded
	);

	return {
		encryptedMessage: bufferToString(encryptedMessage),
		iv: bufferToString(iv)
	};
};

export async function decrypt(key, ciphertext, ivStr) {
	const message = stringToUint8Array(ciphertext);
	const iv = stringToUint8Array(ivStr);
	return bufferToString(await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, message));
}
