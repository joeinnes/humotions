<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/db/db';
	import chroma from 'chroma-js';
	import dayjs from 'dayjs';
	import { getHue, getEntryColour } from '$lib/utils/utils';
	import { entries } from '$lib/stores/data';
	import { toastStore } from '@skeletonlabs/skeleton';
	import Entry from '$lib/components/Entry.svelte';

	const deleteEntry = async (entry) => {
		try {
			const timer = setTimeout(() => {
				pb.collection('entries').delete(entry.id);
			}, 5000);
			const entriesCache = [...$entries];
			$entries = $entries.filter((el) => el.id !== entry.id);
			await toastStore.trigger({
				message: 'Entry deleted',
				preset: 'error',
				duration: '5000',
				action: {
					label: 'Undo',
					response: () => {
						$entries = entriesCache;
						clearTimeout(timer);
					}
				}
			});
			invalidateAll();
			goto('/');
		} catch (e) {
			console.error(e);
		}
	};
</script>

<section class="flex flex-col gap-2">
	{#if $entries.length}
		{#each $entries as entry (entry.id)}
			<Entry {entry} del={deleteEntry} />
		{/each}
	{/if}
</section>
