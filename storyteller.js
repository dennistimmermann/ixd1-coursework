if (navigator.userAgent.match(/AppleWebKit/) && ! navigator.userAgent.match(/Chrome/)) {
	//alert('this is safari brower and only safari brower')
	$('body').addClass('s-b-2-safari')
}

var player = SC.Widget($('#scplayer')[0])
var timer = 50000

var volume = {}
volume.video = $('#video-volume')[0]
volume.handle = $('#handle-volume')
volume.video_update = function(e) {
	if(e && e.set) { var pos = e.set }
	else { var pos = volume.handle.position().left/170 }
	volume.video.pause()
	volume.video.currentTime = volume.video.duration * (pos)
	player.setVolume(100-pos*100)
}

var play = {}
play.video = $('#video-play')[0]
play.play = $('#button-play')
play.pause = $('#button-pause')
play.video.addEventListener('timeupdate', function(e) {
	var v = play.video
	if(v.currentTime > play.stop_at) { v.pause() }
})

var next = {}
next.video = $('#video-next')[0]
next.next = $('#button-next')
next.prev = $('#button-prev')
next.video.addEventListener('timeupdate', function(e) {
	var v = next.video
	if(v.currentTime > next.stop_at) { v.pause() }
})

var squish = {}
squish.video = $('#video-squish')[0]
squish.squish = $('#button-squish')

var bar = $('#bar')

var countup = _.throttle(function() {
	timer = _.min([timer+5000,50000])
}, 1000)

$(document).ready(function() {

	volume.handle.pep({
		constrainTo: 'parent',
		drag: volume.video_update
	})

	play.pause.on('click', function(e) {
		var v = play.video
		v.currentTime = 1.5
		play.stop_at = 999
		v.play()
		_.delay(function(p) {p.pause()}, 900, player)
	})
	play.play.on('click', function(e) {
		var v = play.video
		v.currentTime = 0
		play.stop_at = 1.5
		v.play()
		_.delay(function(p) {p.play()}, 1100, player)
	})

	next.next.on('click', function(e) {
		var v = next.video
		v.currentTime = 0
		next.stop_at = 1.5
		v.play()
		_.delay(function(p) {p.next()}, 1000, player)
	})
	next.prev.on('click', function(e) {
		var v = next.video
		v.currentTime = 1.5
		next.stop_at = 999
		v.play()
		_.delay(function(p) {p.prev()}, 1300, player)
	})

	squish.squish.on('click', function(e) {
		var v = squish.video
		v.currentTime = 0
		v.play()
		_.delay(function() {timer = _.max([50000,timer])},2000)
	})

	var interval = setInterval(function() {
		timer = _.max([0, timer-1000])
		if(timer < 40000) {
			var color = '#ffffff'
			player.setVolume(timer/40000*100)
		} else {
			var color = '#ee3333'
		}
		bar.animate({'height': (timer/50000*100)+'%', backgroundColor: color}, 1000, 'linear')
	}, 1000)

	$('body').on('mousemove', function() {
		countup()
	})

	$('video').each(function(i, e) {
		if(e.readyState > 1) {
			e.play();
			e.pause();
		}
	})
})
