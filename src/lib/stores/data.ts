import { writable } from 'svelte/store';
import { pb } from '$lib/db/db';

interface User {
	id: string;
	username: string;
	email: string;
	name?: string;
	avatar?: string;
	created: Date;
	updated: Date;
}

interface Entry {
	id: string;
	date: Date;
	created_by: string;
	notes?: string;
	attachment?: string;
	emotions?: string[];
	created: Date;
	updated: Date;
}

interface Emotion {
	id: string;
	name: string;
	hue: number;
	parent_emotion: string;
	created: Date;
	updated: Date;
}

export const entries = writable<Entry[]>([]);
export const user = writable<User>();
export const emotions = writable<Emotion[]>([]);
