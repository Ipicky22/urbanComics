export function normalizeData(data: string, symbol: string = ":", index: number = 1): string {
	let dataValue: string | undefined = data.split(symbol)[index]?.trim();
	dataValue = dataValue?.replace("</b> ", "");
	dataValue = dataValue?.replace("</a", "");
	return dataValue ? dataValue : "";
}

export function normalizePascalCase(data: string): string {
	let result = data.replace(/(\w)(\w*)/g, function (_g0, g1, g2) {
		return g1.toUpperCase() + g2.toLowerCase();
	});
	return result;
}

export function normalizeDescription(data: string): string {
	let result: string | undefined;
	let descriptionRemoveTitle: string[] | undefined = data.split("</h1>");
	let descriptionRemoveFields: string[] | undefined = descriptionRemoveTitle[1]?.split("<br>");
	if (descriptionRemoveFields !== undefined) result = descriptionRemoveFields[0]?.replaceAll("\n\t", "");
	return result ? result : "";
}

export function normalizeName(comicName: string): string {
	let nameFormatted: string = comicName.toLowerCase();
	nameFormatted = nameFormatted.replaceAll(" : ", "-");
	nameFormatted = nameFormatted.replaceAll(" & ", "-");
	nameFormatted = nameFormatted.replaceAll(".", "-");
	nameFormatted = nameFormatted.replaceAll(" - ", "-");
	nameFormatted = nameFormatted.replaceAll(" ", "-");
	return nameFormatted;
}

export function normalizeTome(comicTome: string): string {
	let formatFormatted: string = comicTome.toLowerCase().replaceAll(" ", "-");
	return formatFormatted;
}

export default { normalizeData, normalizePascalCase, normalizeDescription, normalizeName, normalizeTome };
