export type Comics = Comic[];

export type Comic = ComicPartial & ComicDetails;

export interface ComicPartial {
	imgUrl: string;
	author: string;
	title: string;
	tome: string;
	price: string;
}

export interface ComicDetails {
	url: string;
	age: string;
	description: string;
	collection: string;
	serie: string;
	sortie: string;
	pagination: string;
	ean: string;
}
