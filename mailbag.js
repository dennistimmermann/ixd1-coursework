if (navigator.userAgent.match(/AppleWebKit/) && ! navigator.userAgent.match(/Chrome/)) {
	//alert('this is safari brower and only safari brower')
	$('body').addClass('m-b-2-safari')
}

var mails = []
var sendMail = function() {
	if(Notification.permission !== 'granted'){
		Notification.requestPermission();
	}
	mails.push(new Notification( "Hello", {
		body: "This is a test",
		icon : "star.ico"
	}))
	up.video_update()
	badge.fadeIn(500)
	badge.html(mails.length)
}
var closeMail = function() {
	_(mails).each(function(e) {	e.close() })
}

var up ={}
up.video = $('#video-up')[0]
up.video_update = function() {
	var curTime = up.video.currentTime
	var duration = up.video.duration
	if(curTime/mails.length < duration/5) { up.video.play()	}
}
up.video.addEventListener('timeupdate', function(e) {
	var curTime = up.video.currentTime
	var duration = up.video.duration
	if(curTime/mails.length > duration/5) {	up.video.pause() }
})

var down = {}
down.video = $('#video-down')[0]
down.button = $('#button-down')

var badge = $('#badge')
var send = $('#send')

reset['reset-up'] = function() {
	if(up.video.readyState > 1) {
		up.video.pause();
		up.video.currentTime = 0;
		up.video_update();
	}
}
reset['reset-down'] = function() {
	down.button.fadeIn(500)
	if(down.video.readyState > 1) {
		down.video.pause()
		down.video.currentTime = 0
	}
}

$(document).ready(function() {



	send.on('click', function() {
		sendMail()
	})

	down.button.on('click', function(e) {
		down.video.play()
		down.button.fadeOut(500)
		badge.html(mails.length)
		_.delay(function() {
			closeMail()
			mails = []
			badge.fadeOut(500)
		}, 2000)
	})
})
