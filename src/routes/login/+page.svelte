<script lang="ts">
	import { goto } from '$app/navigation';
	import { toastStore } from '@skeletonlabs/skeleton';

	import { pb } from '$lib/db/db';
	import { pageBgColour } from '$lib/stores/colour';
	let email = '';
	let password = '';
	let error = '';
	let loggingIn = false;

	if (pb.authStore.isValid) {
		goto('/');
	}

	const submitHandler = async () => {
		if (loggingIn) return;
		try {
			loggingIn = true;
			const authData = await pb.collection('users').authWithPassword(email, password);
			window.location.href = '/';
		} catch (e) {
			loggingIn = false;
			toastStore.trigger({
				message: 'Authentication failed',
				preset: 'error',
				duration: '5000'
			});
		}
	};
</script>

<form
	on:submit|preventDefault={submitHandler}
	class="shadow-lg p-8 max-w-prose w-full bg-white rounded-xl mx-auto mt-8"
>
	<img src="/logo.svg" />
	<h1 class="text-2xl mb-2 font-bold">Log In</h1>
	<label class="block mb-4">
		<span>Email or username</span>
		<input type="text" bind:value={email} class="border rounded p-2 w-full" />
	</label>

	<label class="block mb-4">
		<span>Password</span>
		<input type="password" bind:value={password} class="border rounded p-2 w-full" />
	</label>

	<button
		type="submit"
		class="bg-green-400 text-green-900 hover:bg-green-600 hover:text-green-200 transition-colors px-2 py-1 rounded"
		disabled={loggingIn}>Log In</button
	>
	<a href="/register" class="pl-2">Register</a>
</form>
