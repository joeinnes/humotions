<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/db/db';
	import { pageBgColour } from '$lib/stores/colour';
	let email = '';
	let password = '';
	let error = '';

	const submitHandler = async () => {
		try {
			const authData = await pb.collection('users').authWithPassword(email, password);
			goto('/');
		} catch (e) {
			error = e.message;
			console.error(e.message);
		}
	};

	$: {
		if (error) {
			setTimeout(() => (error = ''), 5000);
		}
	}
</script>

<form
	on:submit|preventDefault={submitHandler}
	class="shadow-lg p-8 max-w-prose w-full bg-white rounded-xl mx-auto mt-8"
>
  <img src="/logo.svg" />
	<h1 class="text-2xl mb-2 font-bold">Log In</h1>
	<label class="block mb-4">
		<span>Email or username</span><br />
		<input type="text" bind:value={email} class="border rounded p-2 w-full" />
	</label>

	<label class="block mb-4">
		<span>Password</span><br />
		<input type="password" bind:value={password} class="border rounded p-2 w-full" />
	</label>

	<button
		type="submit"
		class="bg-green-400 text-green-900 hover:bg-green-600 hover:text-green-200 transition-colors px-2 py-1 rounded"
		>Log In</button
	>
</form>

{#if error}
	{error}
{/if}
