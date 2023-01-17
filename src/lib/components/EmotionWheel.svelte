<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import { getHue, getEntryColour } from '$lib/utils/utils';
	import chroma from 'chroma-js';
	export let clickHandler = (el) => {};
	export let emotions = [];
	let ctx;
	const innerEmotions = emotions.filter((emotion) => !emotion?.parent_emotion);
	const midEmotions = emotions.filter(
		(emotion) => emotion?.parent_emotion && !emotion?.expand?.parent_emotion?.expand?.parent_emotion
	);
	const outerEmotions = emotions.filter(
		(emotion) =>
			emotion?.parent_emotion &&
			emotion?.expand?.parent_emotion &&
			emotion?.expand?.parent_emotion?.expand?.parent_emotion
	);
	const splitLine = (line) => {
		// Try to make sure all the emotions fit on two lines by splitting at the space closest to the middle when the line is over 14 characters long
		if (line.length < 14) return line;
		let firstPart = line;
		let secondPart = '';
		const midChar = Math.floor(line.length / 2);
		for (let i = 0; i < line.length / 2; i++) {
			if (line[midChar + i] === ' ') {
				firstPart = line.substr(0, midChar + i);
				secondPart = line.substr(midChar + i + 1);
				return firstPart + '\n' + secondPart;
			} else if (line[midChar - i] === ' ') {
				firstPart = line.substr(0, midChar - i);
				secondPart = line.substr(midChar - i + 1);
				return firstPart + '\n' + secondPart;
			}
		}
		return line;
	};

	const data = {
		datasets: [
			{
				labels: outerEmotions.map((el) => splitLine(el.name)),
				rotation: -30,
				data: outerEmotions.map((el) => ({ ...el, val: 1 }))
			},
			{
				labels: midEmotions.map((el) => splitLine(el.name)),
				rotation: -30,
				data: midEmotions.map((el) => ({ ...el, val: 1 }))
			},
			{
				labels: innerEmotions.map((el) => splitLine(el.name)),
				rotation: -30,
				data: innerEmotions.map((el) => ({ ...el, val: 1 }))
			}
		]
	};

	const config = {
		type: 'pie',
		data: data,
		plugins: [ChartDataLabels],
		options: {
			elements: {
				arc: {
					backgroundColor: function (context) {
						if (context.type !== 'data') return;
						let c = getHue(context.raw);
						if (!c) {
							return;
						}
						if (context.active) {
							// c = helpers.getHoverColor(c);
						}

						const start = chroma(c, 1, context.active ? 0.45 : 0.45, 'hsl'); //.hex();
						const mid = chroma(c, 1, context.active ? 0.4 : 0.42, 'hsl'); //.hex();
						const end = chroma(c, 1, context.active ? 0.35 : 0.41, 'hsl'); //.hex() ;

						// linear-gradient(115deg, {todaysColour.luminance(0.25)} 0%, {todaysColour.luminance(0.2)} 35%, {todaysColour.luminance(0.02)} 100%);; color: {todaysColour.luminance(0.9)}
						return createRadialGradient3(context, start, mid, end);
					},
					borderColor: '#ffffffff'
				}
			},
			parsing: {
				key: 'val'
			},
			onClick: (e, arr, chart) => {
				try {
					const emotion = chart.data.datasets[arr[0].datasetIndex].data[arr[0].index];
					clickHandler(emotion);
				} catch (e) {
					console.log('Invalid click');
				}
			},
			responsive: true,
			plugins: {
				datalabels: {
					textAlign: 'center',
					formatter: function (value, context) {
						return context.dataset.labels[context.dataIndex].toUpperCase();
					},
					labels: {
						value: {
							font: {
								size: '18vw',
								lineHeight: 0.8,
								family: `'Swanky And Moo Moo', 'Avenir Next', 'Avenir', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
							}
						}
					},
					anchor: 'center',
					rotation: function (ctx) {
						if (ctx.datasetIndex === 2) {
							return 0;
						}
						const valuesBefore = ctx.dataset.data
							.slice(0, ctx.dataIndex)
							.map((el) => el.val)
							.reduce((a, b) => a + b, 0);
						const sum = ctx.dataset.data.map((el) => el.val).reduce((a, b) => a + b, 0);
						const rotation = ((valuesBefore + ctx.dataset.data[ctx.dataIndex].val / 2) / sum) * 360;
						// This is a bit odd because I'm rotating the wheel 30 degrees anti-clockwise, so numbers are offset from 90 and 180.
						return rotation < 210 && rotation > 30 ? rotation - 120 : rotation + 60;
					},
					color: function (ctx) {
						return 'white';
					}
				},
				tooltip: {
					enabled: false
				}
			}
		}
	};

	const cache = new Map();
	let width = null;
	let height = null;

	function createRadialGradient3(context, c1, c2, c3) {
		const chartArea = context.chart.chartArea;
		if (!chartArea) {
			// This case happens on initial chart load
			return;
		}

		const chartWidth = chartArea.right - chartArea.left;
		const chartHeight = chartArea.bottom - chartArea.top;
		if (width !== chartWidth || height !== chartHeight) {
			cache.clear();
		}
		let gradient = cache.get(c1 + c2 + c3);
		if (!gradient) {
			// Create the gradient because this is either the first render
			// or the size of the chart has changed
			width = chartWidth;
			height = chartHeight;
			const centerX = (chartArea.left + chartArea.right) / 2;
			const centerY = (chartArea.top + chartArea.bottom) / 2;
			const r = Math.min(
				(chartArea.right - chartArea.left) / 2,
				(chartArea.bottom - chartArea.top) / 2
			);
			const ctx = context.chart.ctx;
			gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
			gradient.addColorStop(0, c1);
			gradient.addColorStop(0.35, c2);
			gradient.addColorStop(1, c3);
			cache.set(c1 + c2 + c3, gradient);
		}

		return gradient;
	}

	onMount(() => {
		// Don't bother loading the canvas if it's not visible
		if (!ctx.height) return;
		const chart = new Chart(ctx, {
			...config,
			data: data
		});
	});
</script>

<div class="w-full aspect-square hidden lg:block"><canvas bind:this={ctx} /></div>

<div class="w-full lg:hidden">
	{#each innerEmotions as coreEmotion}
	{@const coreEmotionHue = getHue(coreEmotion)}
		<details
			style="background-color: hsl({coreEmotionHue} 80% 70%); color: hsl({coreEmotionHue} 80% 10%)"
			class="rounded px-2 py-2 mb-2 cursor-pointer"
		>
			<summary>{coreEmotion.name}</summary>
			<div
				style="background-color: hsl({coreEmotionHue} 80% 90%); color: hsl({coreEmotionHue} 80% 10%)"
				class="rounded px-2 py-2 mb-2 cursor-pointer mt-2"
			>
				{coreEmotion.name}
			</div>
			<div class="grid grid-cols-2 gap-2">
				{#each midEmotions as mEm}
					{#if mEm.parent_emotion === coreEmotion.id}
						<div
							style="background-color: hsl({coreEmotionHue} 80% 90%); color: hsl({coreEmotionHue} 80% 10%)"
							class="rounded px-2 py-2"
						>
							{mEm.name}
						</div>
					{/if}
				{/each}
				{#each outerEmotions as oEm}
					{#if oEm.expand.parent_emotion.parent_emotion === coreEmotion.id}
						<div
							style="background-color: hsl({coreEmotionHue} 80% 90%); color: hsl({coreEmotionHue} 80% 10%)"
							class="rounded px-2 py-2"
						>
							{oEm.name}
						</div>
					{/if}
				{/each}
			</div>
		</details>
	{/each}
</div>
