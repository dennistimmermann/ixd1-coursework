if (navigator.userAgent.match(/AppleWebKit/) && ! navigator.userAgent.match(/Chrome/)) {
	//alert('this is safari brower and only safari brower')
	$('body').addClass('l-b-2-safari')
}

// globals
var light = {current: true}
var active = ''

var responses = [
	{ m: 'Nope', t: 0, cb: null },
	{ m: 'Okay', t: 1, cb: null }
]

var html = $('html')

var videos = $('.light')
videos.each(function(i, e) {
	e.addEventListener('timeupdate', function() {
		var v = e
		if(light.current && v.currentTime > v.duration/2 ) { v.pause() }
	})
})

var setVideo = function(video) {
	if(video.readyState > 1) {
		if(light.current) { video.currentTime = video.duration/2 }
		else { video.currentTime = 0 }
	}
}

var setLight = function(val) {
	if(val) { html.removeClass('darken') }
	if(!val){ html.addClass('darken') }
	light.current = val
}

var power = {}
power.button = $('#button-power')
power.badge = $('#prickbadge')
power.video = $('#video-power')[0]

var audio = {}
audio.active = false
audio.video = $('#video-audio')[0]
audio.indicator = $('#indicator-audio > .outer-audio')
audio.button = $('#indicator-audio')

var sound = {}
sound.collection = []
sound.add = _.throttle(function(e) {
	sound.collection.push(e)
	if(sound.collection.length > 100) {	sound.collection.shift() }
},200)
sound.average = function() {
	return _.reduce(sound.collection, function(sum, num) {
		return sum + num
	}, 0)/sound.collection.length
}
var fillSound = function(v) {
	sound.collection.length = 0
	for(var i = 100; i > 0; i--) { sound.collection.push(v)	}
}

var rand = {}
rand.video = $('#video-random')[0]
rand.timer = null
rand.set = function() {
	rand.timer = setTimeout(function() {
		setVideo(rand.video)
		setLight(!light.current)
		rand.video.play();
		rand.set()
	}, _.random(2000,8000))
}

reset['light'] = function() {
	videos.each(function(i, e) { setVideo(e) })
	active = ''
	clearTimeout(rand.timer)
}
reset['reset-audio'] = function() {
	sound.collection.length = 0
	fillSound(10)
	setLight(true)
	reset['light']()
	active = 'audio'
	setVideo(audio.video)
	audio.video.play();
}
reset['reset-random'] = function() {
	reset['light']()
	active = 'random'
	rand.set()
	setVideo(rand.video)
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.getUserMedia({audio:true, video:false}, function(stream){
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext() ;
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    audioContext.createJavaScriptNode = audioContext.createJavaScriptNode  || audioContext.createScriptProcessor
    javascriptNode = audioContext.createJavaScriptNode(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

    javascriptNode.onaudioprocess = function() {
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += array[i];
        }

        var average = values / length;
        sound.add(average)

    }
}, function(e) {console.log('nope')})

$(document).ready(function() {

	videos.each(function(i, e) {
		e.playbackRate = 2.0;
	})

	power.button.on('click', function() {
		var resp = _.sample(responses)
		console.log(resp.m)
		if(resp.t) {

			setVideo(power.video)
			setLight(!light.current)
			power.video.play();
		}
		power.badge.stop().html(resp.m).fadeIn(100).delay(500).fadeOut(100)
	})

	audio.button.on('click', function() {
		if(sound.average() > 15) { fillSound(10) }
		else { fillSound(30) }
	})

	var s = setInterval(function() {
		var avg = sound.average()
		console.log(avg, sound.collection.length)
		audio.indicator.css({'-webkit-transform':'scale('+((avg/50)+0.3)+')'})
		audio.indicator.css({'-moz-transform':'scale('+((avg/50)+0.3)+')'})
		audio.indicator.css({'transform':'scale('+((avg/50)+0.3)+')'})
		if(avg < 15 && !light.current && active == 'audio') {
			setVideo(audio.video)
			setLight(true)
			audio.video.play();
		} else if(avg > 15 && light.current && active == 'audio') {
			setVideo(audio.video)
			setLight(false)
			audio.video.play();
		}
	},200)

	fillSound(10)
	setLight(true)
	console.log('reeeedy')
})
