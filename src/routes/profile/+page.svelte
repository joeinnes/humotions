<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Avatar, FileButton, toastStore } from '@skeletonlabs/skeleton';
	import { user } from '$lib/stores/data';
	import { pb } from '$lib/db/db';
	import { pageBgColour } from '$lib/stores/colour';
	let email = $user.email;
	let password = '';
	let passwordConfirm = '';
	let oldPassword = '';
	let name = $user.name;
	let username = $user.username;
	let error = {};
  // TODO: Implement avatar removal
	let removeAvatar = null;
	let image;
	let showImage;
	let avatar;
	let currentAvatar;
	let loggingIn = false;

	const avatarChange = () => {
		const file = avatar[0];
		if (file) {
			showImage = true;
			const reader = new FileReader();
			reader.addEventListener('load', function () {
				image = reader.result;
			});
			reader.readAsDataURL(file);
			return;
		}
		showImage = false;
	};

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
		if (!oldPassword && password) {
			toastStore.trigger({
				message: "You didn't provide your old password",
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
			if (removeAvatar) {
				data.avatar = null;
			}

      let record;
			if (!image) {
				record = await pb.collection('users').update($user.id, data);
			} else {
				const formData = new FormData();
				for (let key in data) {
					formData.append(key, data[key]);
				}
				formData.append('avatar', avatar[0]);
				record = await pb.collection('users').update($user.id, formData);
			}
			loggingIn = false;
			$user = record;

			toastStore.trigger({
				message: 'Profile updated!',
				preset: 'success',
				duration: '5000'
			});
      window.location.reload();
		} catch (e) {
			console.log(e);
			error = e?.data?.data;
			loggingIn = false;
			toastStore.trigger({
				message: 'Update unsuccessful',
				preset: 'error',
				duration: '5000'
			});
		}
	};

	onMount(async () => {
		if ($user.avatar && pb) {
			currentAvatar = await pb.getFileUrl($user, $user.avatar, { thumb: '100x250' });
		}
	});
</script>

<form
	on:submit|preventDefault={submitHandler}
	class="shadow-lg p-8 max-w-prose w-full bg-white rounded-xl mx-auto mt-8"
>
	<h1 class="text-2xl mb-2 font-bold">Update</h1>
	<small>Change your personal data</small>
	{#if showImage}
		<Avatar src={image} alt="Avatar for {$user.name}" border="border-4" width="w-36" />
	{:else if $user.avatar}
		<Avatar src={currentAvatar} alt="Avatar for {$user.name}" border="border-4" width="w-36" />
	{:else}
		<Avatar
			initials={$user.name ? $user.name.substring(0, 2) : $user.username.substring(0, 2)}
			alt="Avatar for {$user.name}"
			border="border-4"
			width="w-36"
		/>
	{/if}

	<FileButton
		accept="image/png, image/jpeg"
		bind:files={avatar}
		on:change={avatarChange}
		id="avatar"
		name="avatar"
		type="file">Upload Avatar</FileButton
	>
	<label class="block my-4">
		<span>Email</span>
		<input
			type="text"
			bind:value={email}
			class="border rounded p-2 w-full"
			placeholder="winnethepooh@hundredacrewood.com"
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

	<fieldset class="border rounded-xl p-4 pt-0 mb-4">
		<legend>Update password</legend>
		<p class="pb-2">Leave blank for no change</p>
		<label class="block mb-4">
			<span>Old Password</span>
			<input
				type="password"
				bind:value={oldPassword}
				class="border rounded p-2 w-full"
				placeholder="iH8Heffalumpz!"
			/>
		</label>

		<label class="block mb-4">
			<span>Password</span>
			<input
				type="password"
				bind:value={password}
				class="border rounded p-2 w-full"
				placeholder="iH8Heffalumpz!"
			/>
		</label>

		<label class="block mb-4">
			<span>Confirm Password</span>
			<input
				type="password"
				bind:value={passwordConfirm}
				class="border rounded p-2 w-full"
				placeholder="iH8Heffalumpz!"
			/>
			{#if error.password}{error.password.message}{/if}
		</label>
	</fieldset>

	<button
		type="submit"
		class="bg-green-400 text-green-900 hover:bg-green-600 hover:text-green-200 transition-colors px-2 py-1 rounded"
		disabled={loggingIn}>Save</button
	>
</form>
