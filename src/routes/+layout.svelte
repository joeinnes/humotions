<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/all.css';
	import '../app.css';
	import { AppShell, Toast } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/db/db';
	import { pageBgColour } from '$lib/stores/colour';
	import { user, entries } from '$lib/stores/data';
	import Header from '$lib/components/Header.svelte';
	let loading = true;
	onMount(async () => {
		try {
			if (!pb.authStore.isValid) {
				await goto('/login');
			} else {
				if (!$user) {
					$user = await pb.collection('users').getOne(pb.authStore.model.id);
				}
				$entries = await pb.collection('entries').getFullList(200, {
					sort: '-created',
					expand: 'emotions,emotions.parent_emotion,emotions.parent_emotion.parent_emotion'
				});

				pb.collection('entries').subscribe('*', e => {
					switch (e) {
						case 'create':
							$entries = [...$entries, e.record].sort(a, b => a.created < b.created);
							break;
						case 'update':
							const newEntries = [...$entries];
							entries.find(el => el.id === e.record.id);
							break;
						case 'delete':

						default: 
							console.error(e);
					}
				})
			}
		} catch (e) {
			console.error(e);
			await goto('/login');
		} finally {
			loading = false;
		}
	});
</script>

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
