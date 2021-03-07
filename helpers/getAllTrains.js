const { default: axios } = require("axios")

const allTrainURL = "http://www.zugradar.at/bin/query.exe/dny?look_minx=7880768&look_maxx=18306793&look_miny=45577886&look_maxy=50564379&tpl=trains2json2&look_productclass=63&look_json=yes&performLocating=1&look_nv=get_zntrainname|no|attr|81|zugposmode|2|interval|30000|intervalstep|30000|maxnumberoftrains|500|"

/**
 * @typedef tObject
 * @property {string} x Geo X
 * @property {string} y Geo y
 * @property {string} n Name
 * @property {string} i URL part
 * @property {string} d ? "21"
 * @property {string} c ? "16"
 * @property {string} r date
 * @property {string} rt ? "4"
 * @property {string} l Final Stop
 * @property {Array} p { x: '14837208', y: '48105980', t: '0', d: '21' },
 */

module.exports = async function() {
	let trains = await axios.get(allTrainURL);

	if(!trains.data && !trains.data.t) return [];
	
	return trains.data.t.map(/** @type {tObject) */ t => ({name: t.n.trim(), url: t.i, final: t.l}));
}