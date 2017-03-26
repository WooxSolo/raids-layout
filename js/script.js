
var boxSize = 50;
var boxMargin = 12;
var floorMargin = 16;
var borderWidth = 6;

var selectedBox;
var links = [];
var values = new Array(16);

var solutions;

function setupBoxes() {
	var boxes = $(".box");
	for (var i = 0; i < boxes.length; i++) {
		var box = $(boxes[i]);
		var id = parseInt(box.data("box-id"));
		var x = id % 4 * (boxSize + boxMargin);
		var y = id % 8 < 4 ? 0 : boxSize + boxMargin;
		if (id >= 8) x += 4 * (boxSize + boxMargin) + floorMargin;
		box.css("left", x);
		box.css("top", y);
	}
	
	solutions = solve();
	solveRaid();
}

function getBoxId(box) {
	return parseInt($(box).data("box-id"));
}

function solveRaid() {
	removeAutoFill();

	var totValid = 0;
	var lastSol;
	var valid;
	for (var solId = 0; solId < solutions.length; solId++) {
		valid = true;
		var sl = solutions[solId].layout;
		for (var i = 0; i < 16; i++) {
			if (values[i] && sl[i] && values[i] !== sl[i].symbol) {
				valid = false;
				break;
			}
		}
		for (var i = 0; i < links.length; i++) {
			if (!sl[links[i].from] ||
				(
				(!sl[links[i].from].next || sl[links[i].from].next !== sl[links[i].to]) &&
				(!sl[links[i].from].prev || sl[links[i].from].prev !== sl[links[i].to])
				))
			{
				valid = false;
				break;
			}
		}
		if (valid) {
			totValid++;
			lastSol = solutions[solId];
		}
	}
	
	$(".solutions-value").text(totValid);
	
	if (totValid === 1) {
		autoFill(lastSol);
	}
}

function autoFill(solution) {
	removeAutoFill();

	var sl = solution.layout;
	for (var i = 0; i < 16; i++) {
		var box = $(".box[data-box-id=" + i + "]");
		if (box.text().length === 0) {
			box.addClass("autofill");
			if (sl[i]) {
				box.text(sl[i].symbol);
				if (sl[i].next) {
					linkBoxes(
						$(".box[data-box-id=" + sl[i].id + "]"),
						$(".box[data-box-id=" + sl[i].next.id + "]"),
						true);
				}
				if (sl[i].prev) {
					linkBoxes(
						$(".box[data-box-id=" + sl[i].id + "]"),
						$(".box[data-box-id=" + sl[i].prev.id + "]"),
						true);
				}
			}
		}
	}
}

function removeAutoFill() {
	$(".box.autofill").removeClass("autofill").text("");
	$(".link.autofill").removeClass("autofill").remove();
}

function selectBox(box) {
	box = $(box);
	if (selectedBox) {
		selectedBox.removeClass("selected");
	}
	
	selectedBox = box;
	
	box.addClass("selected");
}

function setBoxValue(value) {
	if (!selectedBox) return;
	
	var id = getBoxId(selectedBox);
	values[id] = value;
	if (selectedBox.hasClass("autofill")) {
		selectedBox.removeClass("autofill");
	}
	selectedBox.text(value);
	solveRaid();
}

function unlinkBox(box) {
	box = $(box);
	var id = parseInt(box.data("box-id"));

	for (var i = 0; i < links.length; i++) {
		if (links[i].from === id || links[i].to === id) {
			$(links[i].div).remove();
			links.splice(i, 1);
			i--;
		}
	}
	
	solveRaid();
}

function linkBoxes(box1, box2, autofill) {
	box1 = $(box1);
	box2 = $(box2);
	
	var id1 = parseInt(box1.data("box-id"));
	var id2 = parseInt(box2.data("box-id"));
	
	if (id1 > id2) {
		var tmp = id1;
		id1 = id2;
		id2 = tmp;
	}
	
	if (id1 === id2) {
		unlinkBox(box1);
		return true;
	}
	if (id1 < 0 || id1 >= 16 || id2 < 0 || id2 >= 16) {
		return false;
	}
	if (Math.floor(id1 / 8) !== Math.floor(id2 / 8)) {
		return false;
	}
	if (id1 % 8 === 3 && id2 % 8 === 4)
	{
		return false;
	}
	if (id2 - id1 !== 1 && id2 - id1 !== 4) {
		return false;
	}
	for (var i = 0; i < links.length; i++) {
		if (links[i].from === id1 && links[i].to === id2) {
			return false;
		}
	}
	
	var x = id2 % 4 * (boxSize + boxMargin);
	var y = id2 % 8 < 4 ? 0 : boxSize;
	
	var div = $("<div class=\"link\">");
	if (id2 - id1 === 1) {
		div.width(boxMargin);
		div.height(borderWidth);
		y += boxSize / 2 + boxMargin * (id1 % 8 < 4 ? 0 : 1);
		x -= boxMargin;
		y -= borderWidth / 2;
	}
	else {
		div.width(borderWidth);
		div.height(boxMargin);
		x += boxSize / 2;
		x -= borderWidth / 2;
	}
	
	if (id2 >= 8) x += 4 * (boxSize + boxMargin) + floorMargin;
	div.css({
		left: x,
		top: y
	});
	
	var autofills = $(".links.autofill");
	for (var i = 0; i < autofills.length; i++) {
		var af = autofills[i];
		if (af.css("left") === div.css("left") && af.css("top") === div.css("top")) {
			af.remove();
		}
	}
	$(".links").append(div);
	
	if (autofill) {
		div.addClass("autofill");
	}
	else {
		links.push({
			from: id1,
			to: id2,
			div: div
		});
		
		solveRaid();
	}
}

$(document).ready(function() {
	
	setupBoxes();
	
	$(".box").mousedown(function(e) {
		if (e.button === 0) {
			selectBox(this);
		}
		else if (e.button === 2 && selectedBox) {
			linkBoxes(selectedBox, this);
		}
		
		
	});
	
	$(document).click(function(e) {
		if (!$(e.target).hasClass("box") && !$(e.target).hasClass("room-btn")) {
			selectBox();
		}
	});
	
	$(document).contextmenu(function(e) {
		e.preventDefault();
		return false;
	});
	
	$(".room-btn").click(function(e) {
		var val = $(this).val();
		setBoxValue(val);
	});
	
	$(".reset-btn").click(function(e) {
		$(".autofill").removeClass("autofill");
		$(".link").remove();
		$(".box").text("");
		values = new Array(16);
		links = [];
		solveRaid();
	});
	
});
