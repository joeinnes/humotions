<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import chroma from 'chroma-js';
	import { toastStore } from '@skeletonlabs/skeleton';
	import { entries, emotions, key, user } from '$lib/stores/data';
	import { getHue } from '$lib/utils/utils';
		import EmotionWheel from '$lib/components/EmotionWheel.svelte';
	import { pb } from '$lib/db/db';
	import { encrypt } from '$lib/utils/crypto';

	let selectedEmotions = [];
	let notes = '';
	let clW = 0;
	let encryptThis = false;
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
		if ($key && PUBLIC_ENCRYPTION === 'default' || $user.prefers_encryption || encryptThis) {
			const encrypted = await encrypt(notes, $key)
			data.notes = encrypted.encryptedMessage;
			data.iv = encrypted.iv;
		}
		const record = await pb.collection('entries').create(data);
		toastStore.trigger({
			message: 'Entry created',
			preset: 'success',
			duration: '5000'
		});
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
		<textarea
			bind:value={notes}
			class="w-full border rounded h-48 focus:outline-none p-2 bg-surface-50"
		/>
	</label>
	<button
		on:click={addEntry}
		class="bg-green-400 text-green-900 hover:bg-green-600 hover:text-green-200 transition-colors px-2 py-1 rounded"
		>Save</button
	>
</section>
