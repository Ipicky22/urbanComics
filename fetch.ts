import * as fs from "fs";
import playwright from "playwright";
import { ComicPartial } from "type";

async function main() {
	const browser = await playwright.chromium.launch({
		headless: true,
	});

	const page = await browser.newPage();
	await page.goto("https://www.urban-comics.com/shop/");
	let tabComics: ComicPartial[] = [];

	for (let i = 1; i <= 174; i++) {
		let htmlPage: string;
		if (i > 1) {
			const response = await fetch("https://www.urban-comics.com/wp-admin/admin-ajax.php", {
				method: "POST",
				headers: {
					Accept: "*/*",
					"Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
					Connection: "keep-alive",
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					Cookie: "PHPSESSID=heb32to9gsqh3hve5f6fu19slc; _fbp=fb.1.1694615781818.726915398; woocommerce_recently_viewed=51393%7C48859%7C57206%7C48860%7C47863%7C47721%7C51394; _ga_3KL35YB3R4=GS1.1.1694962582.10.1.1694964165.0.0.0; _ga_3KDC221P6W=GS1.1.1694962582.10.1.1694964165.0.0.0; _ga_ELTE09W3KK=GS1.1.1694962582.10.1.1694964165.60.0.0; _ga=GA1.2.2140728752.1694615781",
					Origin: "https://www.urban-comics.com",
					Referer: "https://www.urban-comics.com/shop/",
					"X-Requested-With": "XMLHttpRequest",
				},
				body: new URLSearchParams({
					action: "mdf_get_ajax_auto_recount_data",
					vars: "mdf%5Bfilter_post_blocks%5D%5B%5D=47111&mdf%5Bfilter_post_blocks_toggles%5D%5B%5D=0&mdf%5Btaxonomy%5D%5Bcheckbox%5D%5Bunivers%5D=&mdf%5Bfilter_post_blocks_toggles_tax%5D%5Bunivers%5D=2&mdf%5Btaxonomy%5D%5Bcheckbox%5D%5Bserie%5D=&mdf%5Bfilter_post_blocks_toggles_tax%5D%5Bserie%5D=2&mdf%5Btaxonomy%5D%5Bcheckbox%5D%5Bproduct_tag%5D=&mdf%5Bfilter_post_blocks_toggles_tax%5D%5Bproduct_tag%5D=2&mdf%5Btaxonomy%5D%5Bcheckbox%5D%5Bcollection%5D=&mdf%5Bfilter_post_blocks_toggles_tax%5D%5Bcollection%5D=2&mdf%5Bfilter_post_blocks%5D%5B%5D=47112&mdf%5Bfilter_post_blocks_toggles%5D%5B%5D=2&mdf%5Bmedafi_596f2f82ec130%5D%5Bfrom%5D=&mdf%5Bmedafi_596f2f82ec130%5D%5Bto%5D=&meta_data_filter_bool=AND&mdf_tax_bool=AND&mdf%5Bmdf_widget_options%5D%5Bslug%5D=product&mdf%5Bmdf_widget_options%5D%5Bmeta_data_filter_cat%5D=826&mdf%5Bmdf_widget_options%5D%5Bshow_items_count_dynam%5D=1&mdf%5Bmdf_widget_options%5D%5Btaxonomies_options_post_recount_dyn%5D=1&mdf%5Bmdf_widget_options%5D%5Btaxonomies_options_hide_terms_0%5D=1&mdf%5Bmdf_widget_options%5D%5Bhide_meta_filter_values%5D=0&mdf%5Bmdf_widget_options%5D%5Bhide_tax_filter_values%5D=0&mdf%5Bmdf_widget_options%5D%5Bsearch_result_page%5D=&mdf%5Bmdf_widget_options%5D%5Bsearch_result_tpl%5D=&mdf%5Bmdf_widget_options%5D%5Bwoo_search_panel_id%5D=0&mdf%5Bmdf_widget_options%5D%5Badditional_taxonomies%5D=&mdf%5Bmdf_widget_options%5D%5Breset_link%5D=&meta_data_filter_cat=826",
					slug: "product",
					type: "widget",
					shortcode_id: "0",
					sidebar_id: "sidebar-woocommerce",
					sidebar_name: "15Zine WooCommerce Sidebar",
					widget_id: "metadatafilter_search-2",
					mode: "submit",
					mdf_current_term_id: "0",
					mdf_current_tax: "",
					simple_form_redraw: "0",
					mdf_front_qtrans_lang: "",
					mdf_front_wpml_lang: "",
					mdf_ajax_content_redraw: "true",
					shortcode_txt:
						"mdf_custom post_type=product taxonomies=product_type+813 meta_data_filter_cat=826 template=woocommerce/shop per_page=12 pagination=tb orderby=nom_serie_order order=ASC",
					content_redraw_page: i.toString(),
					mdf_tmp_order: "0",
					mdf_tmp_orderby: "0",
					mdf_is_search_going: "1",
					order_by: "nom_serie_order",
					order: "ASC",
				}),
			});

			const responseJSON = await response.json();
			htmlPage = responseJSON.content;
			page.setContent(htmlPage);
		}

		const comicsPerPage: ComicPartial[] = await page.$eval("#shop-main-container", (headerElm) => {
			const data: ComicPartial[] = [];
			const listElms = headerElm.querySelectorAll("li");

			Array.from(listElms).forEach((elm) => {
				const imgUrl: string | undefined = elm.querySelector("img")?.src;
				const author: string | undefined = elm.querySelector(".caption > div")?.innerHTML;
				const title: string | undefined = elm.querySelector(".caption > h3")?.innerHTML;
				const tome: string | undefined = elm.querySelector(".caption > div:nth-child(3)")?.innerHTML;
				const price: string | undefined = elm.querySelector(".caption-prix > span")?.innerHTML;

				let obj = {
					imgUrl: imgUrl ? imgUrl : "",
					author: author
						? author
								.normalize("NFD")
								.replace(/[\u0300-\u036f]/g, "")
								.replace("amp;", "")
						: "",
					title: title ? title : "",
					tome: tome ? tome : "",
					price: price ? price.replace('<span class="woocommerce-Price-currencySymbol">€</span>', "") : "",
				};

				data.push(obj);
			});
			return data;
		});

		tabComics = [...tabComics, ...comicsPerPage];
		console.log(`Page ${i} done`);
	}
	fs.writeFile(`./data.json`, JSON.stringify(tabComics), (err) => {
		if (err) {
			console.log(err);
		} else {
			console.log("File successfully written!");
		}
	});

	await browser.close();
}

main();
