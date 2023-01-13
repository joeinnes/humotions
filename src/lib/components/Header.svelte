<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/db/db';
	import { user, entries } from '$lib/stores/data';
	import { goto, invalidateAll } from '$app/navigation';
	import { userAllTime } from '$lib/stores/colour';
	import { getHue } from '$lib/utils/utils';
	import chroma from 'chroma-js';
	import { AppShell, AppBar, Avatar, Drawer, drawerStore } from '@skeletonlabs/skeleton';

	let avatar = '';
	let hueList = [];
	let showMenu = false;
	onMount(async () => {
		avatar = await pb.getFileUrl($user, $user.avatar, { thumb: '100x250' });
		if (!$entries.length) {
			$entries = await pb.collection('entries').getFullList(200, {
				sort: '-created',
				expand: 'emotions,emotions.parent_emotion,emotions.parent_emotion.parent_emotion'
			});
		}
		let hues = [];
		$entries.forEach((entry) => {
			let entryAverage = [];
			entry.expand.emotions.forEach((emotion) => {
				entryAverage.push(chroma.hsl(getHue(emotion), 1, 0.5));
			});
			hues = [...hues, chroma.average(entryAverage)];
		});

		hueList = hues;
		$userAllTime = chroma.average(hues);
	});
</script>

<Drawer width="w-1/2">
	<!-- Insert the list: -->
	<nav class="list-nav h-full p-4">
		<ul class="flex flex-col h-full gap-2">
			<li><a href="/" on:click={drawerStore.close}>Home</a></li>
			<li><a href="/entries" on:click={drawerStore.close}>Entries</a></li>
			<li><a href="/about" on:click={drawerStore.close}>About</a></li>
			<li>
				<button
					on:click={() => {
						goto('/entries/new');
						drawerStore.close();
					}}
					class="btn btn-filled-primary"
					><span
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
						</svg>
					</span><span>New Entry</span></button
				>
			</li>
			<div class="flex-1" />
			<li>
				<button
					on:click={() => {
						pb.authStore.clear();
						drawerStore.close();
						goto('/');
					}}
					class="btn btn-filled-error"
					><span
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
							/>
						</svg>
					</span><span>Log Out</span></button
				>
			</li>
		</ul>
	</nav>
	<!-- --- -->
</Drawer>

<header class="flex relative w-full gap-2 items-center justify-center flex-col p-8">
	<div
		class="absolute top-0 h-1/2 w-full border-b-4"
		style="background: linear-gradient(115deg, {$userAllTime.luminance(
			0.2
		)} 0%, {$userAllTime.luminance(0.3)} 35%, {$userAllTime.luminance(
			0.6
		)} 100%); color: {$userAllTime.luminance(0.9)}"
	/>
	<div class="absolute left-4 top-1/4 transform -translate-y-1/2">
		<button
			on:click={() => ($drawerStore.open ? drawerStore.close() : drawerStore.open())}
			class="rounded border-2 p-2"
			style="color: {$userAllTime.luminance(0.9)}"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
				/>
			</svg>
		</button>
	</div>
	<div class="relative">
		<Avatar src={avatar} alt="Avatar for {user.name}" border="border-4" width="w-36" />
	</div>
</header>

<h2 class="-mt-6">{pb?.authStore?.model?.name}</h2>
