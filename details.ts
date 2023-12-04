import { randomUUID } from "crypto";
import { readFileSync, writeFile } from "fs";
import { Browser, Page, chromium } from "playwright";
import { Comic, ComicDetails, Comics } from "type";
import { normalizePascalCase, normalizeData, normalizeDescription, normalizeName, normalizeTome } from "./utils";

async function main() {
	const data: string = readFileSync("./data.json", "utf8");
	const comics: Comics = JSON.parse(data);

	for (let i = 0; i < comics.length; i++) {
		console.log("Scrap comics " + (i + 1) + "/" + comics.length + " starting...");
		await createComicFile(comics[i]!, i + 1, comics.length);
		await new Promise((r) => setTimeout(r, 1000));
	}
}

async function createComicFile(comic: Comic, index: number, length: number) {
	const browser: Browser = await chromium.launch({
		headless: true,
	});

	let imgUrlSplit: string[] = comic.imgUrl.split("/");

	let imgUrlName: string | undefined = imgUrlSplit[imgUrlSplit.length - 1]
		?.slice(0, -4)
		.replaceAll("-rsquo-", "")
		.replaceAll("rsquo", "")
		.replaceAll("-amp", "")
		.replaceAll("8211", "")
		.replaceAll("--", "-");

	if (imgUrlName !== undefined) {
		const page: Page = await browser.newPage();
		let nameNormalized = normalizeName(comic.title);
		let tomeNormalized = normalizeTome(comic.tome);
		let comicUrl = `https://www.urban-comics.com/`;
		let urlWorks = "";
		let triggerErrorFirst = false;
		let triggerErrorSecond = false;
		let triggerErrorThird = false;

		try {
			await page.goto(comicUrl + imgUrlName);
			urlWorks = comicUrl + imgUrlName;
		} catch (e) {
			triggerErrorFirst = true;
		}

		if (triggerErrorFirst) {
			try {
				await page.goto(comicUrl + nameNormalized);
				urlWorks = comicUrl + nameNormalized;
			} catch (e) {
				triggerErrorSecond = true;
			}
		}

		if (triggerErrorSecond) {
			try {
				await page.goto(comicUrl + nameNormalized + "-" + tomeNormalized);
				urlWorks = comicUrl + nameNormalized + "-" + tomeNormalized;
			} catch (e) {
				triggerErrorThird = true;
			}
		}

		if (triggerErrorThird) {
			try {
				await page.goto(comicUrl + nameNormalized + "-" + tomeNormalized.replace("tome", "volume"));
				urlWorks = comicUrl + nameNormalized + "-" + tomeNormalized.replace("tome", "volume");
			} catch (e) {}
		}

		page.waitForSelector("#cb-content");

		let ageSelector: string | undefined,
			descriptionSelector: string | undefined,
			collectionSelector: string | undefined,
			serieSelector: string | undefined,
			sortieSelector: string | undefined,
			paginationSelector: string | undefined,
			eanSelector: string | undefined;

		try {
			ageSelector = await page.locator(".public_album").evaluate((el) => el.innerHTML);
		} catch (e) {
			console.log(`${comic.title} url not found`);
		}

		if (ageSelector) {
			try {
				descriptionSelector = await page.locator("div.eightcol.first").evaluate((el) => el.innerHTML);
			} catch (e) {}
			try {
				collectionSelector = await page.locator(".collection_album").evaluate((el) => el.innerHTML);
			} catch (e) {}
			try {
				serieSelector = await page.locator(".serie_album").evaluate((el) => el.innerHTML);
			} catch (e) {}
			try {
				sortieSelector = await page
					.locator("div.eightcol.first > ul > li:nth-child(1)")
					.evaluate((el) => el.innerHTML);
			} catch (e) {}
			try {
				paginationSelector = await page
					.locator("div.eightcol.first > ul > li:nth-child(2)")
					.evaluate((el) => el.innerHTML);
			} catch (e) {}
			try {
				eanSelector = await page
					.locator("div.eightcol.first > ul > li:nth-child(3)")
					.evaluate((el) => el.innerHTML);
			} catch (e) {}
		}

		let details: ComicDetails = {
			url: urlWorks,
			age: ageSelector ? normalizeData(ageSelector) : "",
			description: descriptionSelector ? normalizeDescription(descriptionSelector) : "",
			collection: collectionSelector ? normalizeData(collectionSelector, ">") : "",
			serie: serieSelector ? normalizePascalCase(normalizeData(serieSelector, ">")) : "",
			sortie: sortieSelector ? normalizeData(sortieSelector) : "",
			pagination: paginationSelector ? normalizeData(paginationSelector) : "",
			ean: eanSelector ? normalizeData(eanSelector) : "",
		};

		let result: Comic = { ...comic, ...details };

		if (!ageSelector) {
			writeFile(`./error/${randomUUID()}.json`, JSON.stringify(result), (err) => {
				if (err) {
					console.log(err);
				} else {
					console.log(`ERROR File ${index}/${length} successfully written!`);
				}
			});
		} else {
			writeFile(`./data/${randomUUID()}.json`, JSON.stringify(result), (err) => {
				if (err) {
					console.log(err);
				} else {
					console.log(`File ${index}/${length} successfully written!`);
				}
			});
		}
	}

	browser.close();
}

main();
