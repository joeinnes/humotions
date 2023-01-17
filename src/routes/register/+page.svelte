<script lang="ts">
	import { goto } from '$app/navigation';
	import { toastStore } from '@skeletonlabs/skeleton';

	import { pb } from '$lib/db/db';
	import { pageBgColour } from '$lib/stores/colour';
	let email = '';
	let password = '';
	let passwordConfirm = '';
	let name = '';
	let username = '';
	let error = {};
	let loggingIn = false;

	if (pb.authStore.isValid) {
		goto('/');
	}

	const submitHandler = async () => {
		if (loggingIn) return;
		if (!password === passwordConfirm) {
			toastStore.trigger({
				message: "Passwords don't match",
				preset: 'error',
				duration: '5000'
			});
			return;
		}
		try {
			loggingIn = true;
			const data = {
				username,
				email,
				password,
				passwordConfirm,
				name,
				emailVisibility: true
			};

			const record = await pb.collection('users').create(data);

			const authData = await pb.collection('users').authWithPassword(email, password);
			window.location.href = '/';
		} catch (e) {
			error = e?.data?.data;
			loggingIn = false;
			toastStore.trigger({
				message: 'Registration unsuccessful',
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
	<h1 class="text-2xl mb-2 font-bold">Register</h1>
	<label class="block mb-4">
		<span>Email</span>
		<input
			type="text"
			bind:value={email}
			class="border rounded p-2 w-full"
			placeholder="winnethepooh@hundredacrewood.com"
			required
		/>
		{#if error.email}{error.email.message}{/if}
	</label>

	<label class="block mb-4">
		<span>Username</span>
		<input
			type="text"
			bind:value={username}
			class="border rounded p-2 w-full"
			placeholder="winniethepooh"
			required
		/>
		{#if error.username}{error.username.message}{/if}
	</label>

	<label class="block mb-4">
		<span>Name</span>
		<input
			type="text"
			bind:value={name}
			class="border rounded p-2 w-full"
			placeholder="Winnie-the-Pooh"
			required
		/>
	</label>

	<label class="block mb-4">
		<span>Password</span>
		<input
			type="password"
			bind:value={password}
			class="border rounded p-2 w-full"
			placeholder="iH8Heffalumpz!"
			required
		/>
	</label>

	<label class="block mb-4">
		<span>Confirm Password</span>
		<input
			type="password"
			bind:value={passwordConfirm}
			class="border rounded p-2 w-full"
			placeholder="iH8Heffalumpz!"
			required
		/>
		{#if error.password}{error.password.message}{/if}
	</label>

	<button
		type="submit"
		class="bg-green-400 text-green-900 hover:bg-green-600 hover:text-green-200 transition-colors px-2 py-1 rounded"
		disabled={loggingIn}>Register</button
	>
	<a href="/login" class="pl-2">Log In</a>
</form>
