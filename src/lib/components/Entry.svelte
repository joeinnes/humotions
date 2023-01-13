<script lang="ts">
	import { fade } from 'svelte/transition';
	import dayjs from 'dayjs';
	import { getEntryColour, getHue, setBackgroundGradient } from '$lib/utils/utils';
	export let entry;
	export let del;
	export let edit;
	const entryColour = getEntryColour(entry);
</script>

{#if entry}
	<article
		class="card p-4"
		style="background: linear-gradient(115deg, {entryColour.luminance(
			0.6
		)} 0%, {entryColour.luminance(0.4)} 35%, {entryColour.luminance(
			0.3
		)} 100%); color: {entryColour.luminance(0.02)}"
	>
		<header class="card-header pt-0 pl-0">
			<h2>{dayjs(entry.date).format('dddd DD MMMM YYYY')}</h2>
			<small
				>{dayjs(entry.date).format('HH:mm')}
				{#if edit}Edit{/if}
				{#if del}<button class="btn btn-ghost-error btn-sm" on:click={() => del(entry)}
						>Delete</button
					>{/if}</small
			>
		</header>
		<div class="py-2">{entry.notes}</div>
		<div class="flex flex-wrap gap-2">
			{#each entry.expand.emotions as emotion}
				<span
					style="background-color: hsl({getHue(emotion)} 90% 30%); color: hsl({getHue(
						emotion
					)} 80% 100%);"
					class="badge">{emotion.name}</span
				>
			{/each}
		</div>
	</article>
{/if}
