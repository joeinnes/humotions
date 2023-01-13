<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
	import { pb } from '$lib/db/db';
	import { entries } from '$lib/stores/data';
	import { getHue, getColourFromEntryList, getEntryColour } from '$lib/utils/utils';
	import { toastStore } from '@skeletonlabs/skeleton';

	import chroma from 'chroma-js';
	import dayjs from 'dayjs';

	import Entry from '$lib/components/Entry.svelte';
	import Month from '$lib/components/Month.svelte';
	import Today from '$lib/components/Today.svelte';

	if (!pb.authStore.isValid && browser) {
		goto('/');
	}

	let todaysEntries = [];

	const deleteEntry = async (entry) => {
		try {
			const timer = setTimeout(() => {
				pb.collection('entries').delete(entry.id);
			}, 5000);
			const entriesCache = [...$entries];
			$entries = $entries.filter((el) => el.id !== entry.id);
			todaysEntries = $entries.filter((entry) => dayjs(entry.date).isSame(dayjs(), 'day'));
			await toastStore.trigger({
				message: 'Entry deleted',
				preset: 'error',
				duration: '5000',
				action: {
					label: 'Undo',
					response: () => {
						$entries = entriesCache;
						todaysEntries = $entries.filter((entry) => dayjs(entry.date).isSame(dayjs(), 'day'));
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

	$: {
		todaysEntries = $entries.filter((entry) => dayjs(entry.date).isSame(dayjs(), 'day'));
	}
</script>

<main class="w-full flex flex-col gap-2">
	<Today />
	{#each todaysEntries as entry}
		{#key entry.id}
			<Entry {entry} del={deleteEntry} />
		{/key}
	{/each}

	<Month />
</main>
