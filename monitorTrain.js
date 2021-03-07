const { default: axios } = require("axios");
const FuzzySearch = require("fuzzy-search");
const { terminal } = require("terminal-kit");
const getAllTrains = require("./helpers/getAllTrains");
const {prompt} = require("./helpers/prompt");

var iconv = require('iconv-lite');

module.exports = async function(train, options = {}) {
	if(options.interval) options.interval = parseInt(options.interval, 10);
	else options.interval = 5;

	let monitorTrain = false;
	let trains = await getAllTrains();
	const FuzzyTrainSearch = new FuzzySearch(trains, ['name']);

	if(train) {
		const testSearch = FuzzyTrainSearch.search(train);
		if(testSearch.length == 1) monitorTrain = testSearch[0];
	} else {
		let answer = await prompt([
			{
					type: 'autocomplete',
					name: 'train',
					message: 'Find a train to monitor:',
					source: async function (answersSoFar, input) {
						return FuzzyTrainSearch.search(input).map((e) => ({
								name: `${e.name} to ${e.final}`,
								value: e,
							}));
					},
				},
		]);
		monitorTrain = answer.train;
	}

	const trainQuery = `http://www.zugradar.at/bin/traininfo.exe/dny/${monitorTrain.url}\?tpl\=JourneyDetails\&date\=${getDate()}\&`

	while(true) {
		let response = await axios.get(trainQuery, { responseType: 'arraybuffer' });
				let stats = false;
		let ctype = response.headers["content-type"];
        if (ctype.includes("charset=ISO-8859-1"))
            stats = JSON.parse(iconv.decode(response.data, "ISO-8859-1"));
         else
            stats = JSON.parse(iconv.decode(response.data, "UTF-8"));


		if(stats) {
			terminal.clear();
			const currentStation = stats.locations[stats.currentLocIndex];
			const lastStop = stats.locations[stats.locations.length-1];
			
			terminal(`\nMonitoring: ^GÖBB ${stats.name}^:\n\n`);

			displayStop("Next Stop", currentStation)
			displayStop("Final Stop", lastStop)

			let dateNow = (new Date()).toLocaleString("de-DE");
			terminal(`Updated: ${dateNow}\n`);
		} else {
			terminal.red("Error Updating");
		}

		await sleep(options.interval);
	}
}

function displayStop(label, station) {
	terminal(`${label}:\n\t^y${station.name}^:\n`)
	terminal(`\tArriving: ^c${station.arrTimeProg}^:`);
	if(station.arrTimeProgMinutes > 0) 
		terminal.red(`\tDelayed by ${station.arrTimeProgMinutes}min\n`);

	terminal("\n\n");
}

function getDate() {
	const o_date = new Intl.DateTimeFormat;
	const f_date = (m_ca, m_it) => Object({...m_ca, [m_it.type]: m_it.value});
	const m_date = o_date.formatToParts().reduce(f_date, {});
	return m_date.day + '.' + m_date.month + '.' + m_date.year.slice(2);
}

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis*1000));
}