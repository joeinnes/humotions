<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/db/db';
	import chroma from 'chroma-js';
	import dayjs from 'dayjs';
	import { getHue, getEntryColour } from '$lib/utils/utils';
	import { entries } from '$lib/stores/data';
	import { toastStore } from '@skeletonlabs/skeleton';
	import Entry from '$lib/components/Entry.svelte';

	let theseEntries = [];
	const deleteEntry = async (entry) => {
		try {
			const timer = setTimeout(() => {
				pb.collection('entries').delete(entry.id);
			}, 5000);
			const entriesCache = [...$entries];
			$entries = $entries.filter((el) => el.id !== entry.id);
			toastStore.trigger({
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
		} catch (e) {
			console.error(e);
		}
	};
	onMount(() => {
		const params = (new URL(document.location)).searchParams;
		const start = params.get('start');
		const end = params.get('end');
		let tempEntries = [...$entries]
		if (start) {
			tempEntries = tempEntries.filter(el => dayjs(el.created).isAfter(dayjs(start)));
		}
		if (end) {
			tempEntries = tempEntries.filter(el => dayjs(el.created).isBefore(dayjs(end)));
		}
		theseEntries = tempEntries;
	});
</script>

<section class="flex flex-col gap-2">
	{#if theseEntries.length}
		{#each theseEntries as entry (entry.id)}
			<Entry {entry} del={deleteEntry} />
		{/each}
	{:else}
		<div class="card card-surface-50 p-4">
			<header class="card-header mb-4">No entries.</header>
			<footer class="card-footer">
				<a href="/entries/new" class="btn btn-filled-primary btn-base"
					><span>+</span><span>Add a new entry</span></a
				>
			</footer>
		</div>
	{/if}
</section>
