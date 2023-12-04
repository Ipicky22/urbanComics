import * as fs from "fs";
import * as path from "path";
import { Comic, Comics } from "./type";

function main() {
	const directoryPath: string = path.join(__dirname, "data");

	fs.readdir(directoryPath, function (err, files) {
		if (err) {
			return console.log("Unable to scan directory: " + err);
		}

		let result: Comics = [];

		files.forEach(function (file: string) {
			let data: string = fs.readFileSync(`./data/${file}`, "utf8");
			let comic: Comic = JSON.parse(data);
			result.push(comic);
		});

		fs.writeFile(`./group.json`, JSON.stringify(result), (err: any) => {
			if (err) {
				console.log(err);
			}
		});
	});
}

main();
