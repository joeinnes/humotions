<script lang="ts">
	import dayjs from 'dayjs';
	import chroma from 'chroma-js';
	import { ntc } from '@cosmicice/namethatcolor';
	import { entries } from '$lib/stores/data';
	import { getColourFromEntryList, getEntryColour, setBackgroundGradient } from '$lib/utils/utils';

	export let month = dayjs().startOf('month');
	const endOfMonth = dayjs().endOf('month');
	let monthColourName;
	let monthColour;
	let thisMonthEntries;
	let dailyColours;

	$: {
		thisMonthEntries = $entries.filter((entry) => dayjs(entry.date).isSame(dayjs(), 'month'));
		if (thisMonthEntries.length) {
			monthColour = getColourFromEntryList(thisMonthEntries);
			monthColourName = ntc.name(monthColour.hex());
		} else {
			monthColour = chroma('#ffffff');
			monthColourName = ntc.name(monthColour.hex());
		}
		dailyColours = thisMonthEntries.reduce((acc, curr) => {
			let day = dayjs(curr.date).format('D');
			let entriesPerDay = [];
			if (acc[day]) {
				entriesPerDay = [...acc[day], curr];
			} else {
				entriesPerDay = [curr];
			}
			return { ...acc, [day]: entriesPerDay };
		}, {});
	}
	const daysInMonth = [
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
		27, 28, 29, 30, 31
	];

	const darkenOnHover = (node) => {
		const bg = chroma(node.style.backgroundColor);
		node.style.backgroundColor = bg.darken();
	};
</script>

<section class="card p-4" use:setBackgroundGradient={monthColour}>
	<header class="card-header mb-4" style:color={monthColour.luminance(0.9)}>
		<h2><a href="/entries?start={month.year()}-{month.month() + 1}-01T00:00&end={month.year()}-{month.month() + 1}-{endOfMonth.date()}T24:00" class="unstyled cursor-pointer">{month.format('MMM YYYY')}</a></h2>
		<p class="mb-4 text-2xl" style:color={monthColour.luminance(0.9)}>
			{#if thisMonthEntries.length}
				{month.format('MMMM')}{#if dayjs().isSame(month, 'month')}'s been{:else} was{/if}
				{#if /[aeiouy]/.test(monthColourName.name.toLowerCase()[0])}an{:else}a{/if}
				{monthColourName.name.toLowerCase()} kind of month.
			{/if}
		</p>
	</header>
	<div style="background-color: #ffffff88" class="flex flex-wrap p-2 flex gap-1 rounded mb-4">
		{#each daysInMonth as dayInMonth}
			<a
				href="/entries?start={month.year()}-{month.month() + 1}-{dayInMonth}T00:00&end={month.year()}-{month.month() + 1}-{dayInMonth}T24:00"
				style="background-color: {getColourFromEntryList(
					dailyColours[dayInMonth]
				)}; color: {dailyColours[dayInMonth] ? '#ffffffcc' : monthColour.luminance(0.02)}"
				class="w-10 aspect-square rounded flex justify-center items-center border-token btn font-bold"
			>
				<span>{dayInMonth}</span>
			</a>
		{/each}
	</div>
	<footer class="card-footer">
		<a
			href="/entries/new"
			class="btn btn-base"
			style="background-color: {monthColour.darken()}; color: {monthColour.brighten(4)}"
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
