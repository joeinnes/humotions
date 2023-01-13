<script lang="ts">
	import dayjs from 'dayjs';
	import { ntc } from '@cosmicice/namethatcolor';
	import { entries } from '$lib/stores/data';
	import { getColourFromEntryList, getEntryColour } from '$lib/utils/utils';
	import chroma from 'chroma-js';

	let todaysColour;
	let todaysColourName: string;
	let todaysEntries = [];
	$: {
		todaysEntries = $entries.filter((entry) => dayjs(entry.date).isSame(dayjs(), 'day'));
		if (todaysEntries.length) {
			todaysColour = getColourFromEntryList(todaysEntries);
			todaysColourName = ntc.name(todaysColour.hex());
		}
	}
</script>

{#if todaysEntries.length}
	<section class="card p-4 card-glass-surface">
		<header class="card-header text-xl mb-4">
			Today's
			{#if /[aeiouy]/.test(todaysColourName.name.toLowerCase()[0])}an{:else}a{/if}
			{todaysColourName?.name.toLowerCase()} kind of day.
		</header>
		<div
			style="background-color: {todaysColour.luminance(0.6)}"
			class="w-full p-2 flex gap-1 rounded mb-4"
		>
			{#each todaysEntries.reverse() as entry}
				<div style="background-color: {getEntryColour(entry)};" class="w-8 h-8 rounded" />
			{/each}
		</div>

		<footer class="card-footer">
			<a
				href="/entries/new"
				class="btn btn-filled-primary btn-base"
				style="background-color: {todaysColour.darken()}; color: {todaysColour.brighten(4)}"
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
				</span><span>Add a new entry</span></a
			>
		</footer>
	</section>
{:else}
	<section class="card card-glass-surface p-4">
		<header class="card-header">Today's a blank slate</header>
		<footer class="card-footer">
			<a href="/entries/new" class="btn btn-filled-primary btn-base"
				><span>+</span><span>Add a new entry</span></a
			>
		</footer>
	</section>
{/if}
