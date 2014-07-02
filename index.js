var reset = []
var prevSheet = {}

$(document).ready(function() {

	var sheets = []

	_($('.sheet')).each(function(e) {
		var fig = $(e).find('.fig')
		fig.css({'opacity': 0})
		sheets.push({
			sheet: $(e),
			fig: fig,
			vis: 0,
			reset: $(e).data('reset')
		})
	})

	var checkVis = function() {
		_(sheets).each(function(e) {
			e.vis = e.sheet.fracs().visible
		})

		triggerFigs(_.max(sheets, 'vis'))

	}

	$(document).on('scroll', checkVis)

	var triggerFigs = function(sheet) {
		//console.log('called')
		if(prevSheet == sheet) {
			return;
		}
		//console.log('changed to', sheet.sheet)
		prevSheet = sheet;
		_(sheets).each(function(e) {
			//console.log(e.fig)
			e.fig.fadeTo(300, 0)
			e.fig.css({'z-index': -1})
		})
		sheet.fig.stop().fadeTo(500, 1)
		sheet.fig.css({'z-index': 0})
		if(sheet.reset && reset[sheet.reset]) {
			reset[sheet.reset]()
		}
	}

	checkVis()
})
