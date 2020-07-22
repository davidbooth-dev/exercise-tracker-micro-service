
var format = function(d){
    let seconds = Math.floor((d) % 60 );
    let minutes = Math.floor((d/60) % 60 );

    seconds = seconds < 10 ? '0' + seconds : '' + seconds;
    minutes = minutes < 10 ? '0' + minutes : '' + minutes;

    return minutes + ":" + seconds;
}

exports.formatter = format;