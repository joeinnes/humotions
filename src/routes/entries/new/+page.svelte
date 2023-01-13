<script lang="ts">
	import { entries, emotions } from '$lib/stores/data';
	import { goto, invalidateAll } from '$app/navigation';
	import { getHue } from '$lib/utils/utils';
	import { pb } from '$lib/db/db';
	import chroma from 'chroma-js';

	let selectedEmotions = [];
	let notes = '';
	let clW = 0;
	if (!$emotions.length) {
		pb.collection('emotions')
			.getFullList(200 /* batch size */, {
				sort: 'created',
				expand: 'parent_emotion,parent_emotion.parent_emotion'
			})
			.then((emotionList) => ($emotions = emotionList));
	}

	const addEntry = async () => {
		const data = {
			date: new Date(),
			notes,
			created_by: pb.authStore.model.id,
			emotions: selectedEmotions.map((el) => el.id)
		};
		const record = await pb.collection('entries').create(data);
		$entries = [record, ...$entries];
		invalidateAll();
		goto('/');
	};

	const selectEmotion = (clickedEmotion) => {
		selectedEmotions = [...new Set([...selectedEmotions, clickedEmotion])];
	};

	const removeEmotion = (clickedEmotion) => {
		selectedEmotions = selectedEmotions.filter((el) => el.id !== clickedEmotion.id);
	};

	let gradient;
	let averageColour;

	import EmotionWheel from '$lib/components/EmotionWheel.svelte';

	$: {
		if (selectedEmotions.length) {
			const hues = selectedEmotions.map((emotion) => {
				return chroma.hsl(getHue(emotion) || 0, 0.8, 0.5);
			});
			averageColour = chroma.average([chroma('#fafafa'), ...hues], 'lab');
		} else {
			averageColour = chroma('#fafafa');
		}
	}
</script>

<section class="card py-8 px-4" bind:clientWidth={clW} style="background-color: {averageColour}">
	<!-- Redraw if client width changes (screen size change) -->
	{#key $emotions + clW}
		<div class="py-2">
			<EmotionWheel clickHandler={selectEmotion} emotions={$emotions} />
		</div>
	{/key}

	<div class="flex gap-2 flex-wrap">
		{#each selectedEmotions as emotion}
			<span
				style="background-color: hsl({getHue(emotion)} 80% 80%);"
				class="text-sm px-2 py-1 rounded-full"
				>{emotion.name} <span on:click={() => removeEmotion(emotion)}>x</span></span
			>
		{/each}
	</div>
	<label>
		<h2 class="block">Notes</h2>
		<textarea bind:value={notes} class="w-full border rounded h-48 focus:outline-none p-2" />
	</label>
	<button
		on:click={addEntry}
		class="bg-green-400 text-green-900 hover:bg-green-600 hover:text-green-200 transition-colors px-2 py-1 rounded"
		>Save</button
	>
</section>
