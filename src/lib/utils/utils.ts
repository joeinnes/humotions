import chroma from 'chroma-js';

export const getHue = (emotion) => {
	return (
		emotion?.hue ||
		emotion?.expand?.parent_emotion?.hue ||
		emotion?.expand?.parent_emotion?.expand?.parent_emotion?.hue ||
		'1'
	);
};

export const getEntryColour = (entry) => {
	try {
		const entryEmotions = entry.expand.emotions.map((emotion) => {
			return chroma.hsl(getHue(emotion), 0.8, 0.5);
		});
		return chroma.average(entryEmotions);
	} catch (e) {
		return chroma('white');
	}
};

export const getColourFromEntryList = (entries) => {
	if (!entries?.length) return 'transparent';
	const entryColours = entries.map((entry) => {
		return getEntryColour(entry);
	});
	return chroma.average(entryColours);
};

export const setBackgroundGradient = (node, monthColour) => {
	node.setAttribute(
		'style',
		`background: linear-gradient(115deg, ${monthColour.luminance(0.3)} 0%, ${monthColour.luminance(
			0.2
		)} 35%, ${monthColour.luminance(0.15)} 100%); color: ${monthColour.luminance(0.9)})`
	);
};
