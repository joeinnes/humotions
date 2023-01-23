<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import { AppShell, Toast } from '@skeletonlabs/skeleton';

	import dayjs from 'dayjs';
	import { pb } from '$lib/db/db';
	import { generateAndWrapKey, unwrapSecretKey } from '$lib/utils/crypto';
	import { pageBgColour } from '$lib/stores/colour';
	import { user, entries, key } from '$lib/stores/data';
	import Header from '$lib/components/Header.svelte';
	let loading = true;
	onMount(async () => {
		try {
			if (!pb.authStore.isValid) {
				await goto('/login');
			} else {
				if (!$user) {
					$user = await pb.collection('users').getOne(pb.authStore.model.id);
					pb.collection('users').subscribe(pb.authStore.model.id, async (e) => {
						$user = e.record;
					});
				}
				if (!$user.key) {
					$user = await pb.collection('users').getOne(pb.authStore.model.id);
					if (!$user.key) {
						const pw = prompt('Enter a decryption password');
						const key = await generateAndWrapKey($user.id,pw);
						await pb.collection('users').update($user.id, {
							key
						});
						$user.key = key;
					}
				}
				if (!$key) {
					const pw = prompt('Enter a decryption password');
					$key = await unwrapSecretKey($user.key, $user.id, pw);
				}
				$entries = await pb.collection('entries').getFullList(200, {
					sort: '-created',
					expand: 'emotions,emotions.parent_emotion,emotions.parent_emotion.parent_emotion'
				});

				pb.collection('entries').subscribe('*', async (e) => {
					switch (e.action) {
						case 'create':
							const newEntry = await pb.collection('entries').getOne(e.record.id, {
								expand: 'emotions,emotions.parent_emotion,emotions.parent_emotion.parent_emotion'
							});
							$entries = [...$entries, newEntry].sort((a, b) =>
								dayjs(a.created) < dayjs(b.created) ? 1 : -1
							);
							break;
						case 'update':
							const newEntries = [...$entries];
							$entries = $entries.map((el) => {
								if (el.id === e.record.id) {
									return e.record;
								}
								return el;
							});
							break;
						case 'delete':
							$entries = $entries.filter((el) => el.id !== e.record.id);
							break;
						default:
							console.error(e);
					}
				});
			}
		} catch (e) {
			console.error(e);
			await goto('/login');
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Huemotions</title>
</svelte:head>
<AppShell>
	<div
		class="transition-colors min-h-screen text-lg flex max-w-screen flex-col justify-center items-center"
		style="background-color: {$pageBgColour};
			background-image: radial-gradient(at 30% 69%, hsla(30, 72%, 70%, 1) 0px, transparent 50%),
				radial-gradient(at 79% 49%, hsla(60, 72%, 70%, 1) 0px, transparent 50%),
				radial-gradient(at 80% 80%, hsla(120, 72%, 70%, 1) 0px, transparent 50%),
				radial-gradient(at 22% 13%, hsla(340, 72%, 70%, 1) 0px, transparent 50%),
				radial-gradient(at 60% 18%, hsla(240, 72%, 70%, 1) 0px, transparent 50%);
			background-size: cover;"
	>
		{#if loading}
			<div class="placeholder animate-pulse" />
		{:else}
			{#if $user}
				<Header />
			{/if}
			<div class="flex-1 w-full p-4 flex-col">
				<slot />
			</div>
		{/if}
	</div>
</AppShell>

<Toast />