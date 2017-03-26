
var codeRegex = new RegExp(/^([A-Z]*)\.([A-Z]*) - #([A-Z]*)#([A-Z]*)$/);	
/*
String-code explanation:
First 5-6 letters are the types of rooms on the first floor
Next 5-6 letters are the types of rooms on the second floor
Next hashtag and 6-7 letters are the directions of the first floor
Next Hashtag and 6-7 letters are the directions of the second floor
*/
var codes = [
	"CFSCP.PCSCF - #ENWWWS#NEESEN",
	"CFSCPC.PCSCPF - #WSEENES#WWWNEEE",
	"CSFCP.CSCPF - #ENESEN#WWWSEE",
	"CSPFC.CCSSF - #NEESEN#WSWWNE",
	"FCPCC.PSCSF - #WWWSEE#ENWWSW",
	"FSCCP.PCSCF - #WNWSWN#ESEENW",
	"FSCCS.PCPSF - #WSEEEN#WSWNWS",
	"FSCPC.CSCPF - #WNWWSE#EENWWW",
	"PCSFC.PCSCF - #WNEEES#NWSWNW",
	"SCCFC.PSCSF - #EEENWW#WSEEEN",
	"SCCFP.CCSPF - #NESEEN#WSWNWS",
	"SCFCP.CCSPF - #ESEENW#ESWWNW",
	"SCFCP.CSCFS - #ENEESW#ENWWSW",
	"SCFCPC.CSPCSF - #ESWWNWS#NESENES",
	"SCFPC.CSPCF - #WSWWNE#WSEENE",
	"SCFPC.PCCSF - #WSEENE#WWWSEE",
	"SCFPC.SCPCF - #NESENE#WSWWNE",
	"SCPFC.CCPSF - #NWWWSE#WNEESE",
	"SCPFC.CSPCF - #NEEESW#WWNEEE",
	"SCPFC.CSPSF - #WWSEEE#NWSWWN",
	"SCSPF.CCSPF - #ESWWNW#ESENES",
	"SFCCP.CSCPF - #WNEESE#NWSWWN",
	"SFCCS.PCPSF - #ENWWSW#ENESEN",
	"SPCFC.CSPCF - #WWNEEE#WSWNWS",
	"SPCFC.SCCPF - #ESENES#WWWNEE",
	"SPSFP.CCCSF - #NWSWWN#ESEENW",
];

function calcStart(dirs) {
	var startPos = 0;
	var pos = 0;
	for (var i = 0; i < dirs.length; i++)
	{
		var c = dirs[i];
		var delta = dirToPosDelta(c);
		pos += delta;
		if (pos < 0 || pos >= 8 ||
			(pos == 3 && delta == -1) ||
			(pos == 4 && delta == 1))
		{
			pos -= delta;
			startPos -= delta;
		}
	}

	return startPos;
}

function dirToPosDelta(dir) {
	if (dir == "N") {
		return -4;
	}
	if (dir == "S") {
		return 4;
	}
	if (dir == "W") {
		return -1;
	}
	if (dir == "E") {
		return 1;
	}
	return 0;
}

function solve() {
	var combs = [];

	for (var codeId = 0; codeId < codes.length; codeId++) {
		var code = codes[codeId];
		var match = code.match(codeRegex);
		
		var symbols, dirs;
		var pos = calcStart(match[3]);
		var rc = {
			layout: []
		};
		var lastRoom;
		var rr;
		
		for (var floor = 0; floor < 2; floor++) {
			symbols = match[1 + floor];
			dirs = match[3 + floor];
			
			for (var i = 0; i < dirs.length; i++) {
				var symbol = (i === 0 ? "#" : symbols.charAt(i - 1));
				rr = {
					id: pos,
					symbol: symbol
				};
				if (lastRoom) {
					lastRoom.next = rr;
					rr.prev = lastRoom;
				}
				rc.layout[pos] = rr;
				lastRoom = rr;
				
				var delta = dirToPosDelta(dirs[i]);
				pos += delta;
			}
			
			rr = {
				id: pos,
				symbol: "¤"
			}
			rr.prev = lastRoom;
			lastRoom.next = rr;
			rc.layout[pos] = rr;
			lastRoom = rr;
			pos += 8;
		}
		
		combs.push(rc);
	}
	
	return combs;
}
