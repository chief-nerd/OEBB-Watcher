const { default: axios } = require("axios");
const FuzzySearch = require("fuzzy-search");
const term = require('terminal-kit').terminal
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
			// term.clear();
			const currentStation = stats.locations[stats.currentLocIndex];
			const lastStop = stats.locations[stats.locations.length-1];
			
			term.bold(`\nMonitoring: ^GÖBB ${stats.name}\n\n`);

			displayStop("Next Stop", currentStation)
			displayStop("Final Stop", lastStop)

			let dateNow = (new Date()).toLocaleString("de-DE");
			term(`Updated: ${dateNow}\n`);
		} else {
			term.red("Error Updating");
		}

		await sleep(options.interval);
	}
}

function displayStop(label, station) {
	term(`${label}:\n`)
	term(`\t^y${station.name}\n`)
	term(`\tArriving: ^c${station.arrTimeProg}`);
	if(station.arrTimeProgMinutes > 0) 
		term.red(`\tDelayed by ${station.arrTimeProgMinutes}min\n`);

	term("\n\n");
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