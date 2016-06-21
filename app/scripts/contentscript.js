// ==UserScript==
// @name			IMDB - Big images on hover
// @author      	Shebo
// @description		View image while hovering it's thumbnail.
// @version			0.2
// @include			http://*.imdb.com/*
// @require			https://code.jquery.com/jquery-2.1.4.min.js


/* CONFIG */
var xOffset = 5,
    yOffset = 10,
    absoluteCursorPos = {},
    relativeCursorPos = {},
    // $ = jQuery.noConflict(),
    anchorSelector, ajaxRequest, Mx, My,
    pictresCache = {};

var linkTypes = {
    title: {
        anon: "http://ia.media-imdb.com/images/G/01/imdb/images/poster/movie_large-2652508870._V_.png",
        posterSelector: ".poster img",
    },
    character: {
        anon: "http://ia.media-imdb.com/images/G/01/imdb/images/nopicture/medium/name-2135195744._CB271220678_.png",
        posterSelector: ".photo img",
    },
    name: {
        anon: "http://ia.media-imdb.com/images/G/01/imdb/images/nopicture/medium/name-2135195744._CB271220678_.png",
        posterSelector: "#name-poster",
    },
};

// preload loading gif
var loadingGif = "http://ia.media-imdb.com/images/G/01/imdb/images/video/trailers/spinner-featured-3267265562._V_.gif";
var preloadLoadingGif = new Image();
preloadLoadingGif.src = loadingGif;


Mx = $(document).width();
My = $(document).height();


// set coordinates for image
var setCoordinates = function(e){
    absoluteCursorPos = {
        x: e.pageX,
        y: e.pageY,
    };

    relativeCursorPos = {
        x: e.clientX,
        y: e.clientY,
    };
};

var createPreview = function(e){
    var urlParts = $(this).attr('href').split('/'),
        type = urlParts[1],
        id = urlParts[2],
        $img = $('<img id="hover-preview" style="position: absolute; border: none; z-index : 1025; display: none; padding: 7px; background: #000 no-repeat scroll center center;" src="'+ loadingGif +'" />').appendTo("body");

    setPicture(type, id, $img);

    calculatePreviewPosition();
    $img.fadeIn("fast");
};

var removePreview = function(){
    $("#hover-preview").remove();
    if (ajaxRequest){
        ajaxRequest.abort();
    }
};

var calculatePreviewPosition = function(){

    var $img = $("#hover-preview"),
        topValue, leftValue,
        trc_x = xOffset + $img.width(),
        trc_y = yOffset + $img.height();

    trc_x = Math.min(trc_x + absoluteCursorPos.x, Mx);
    trc_y = Math.min(trc_y + absoluteCursorPos.y, My);

    topValue = trc_y - $img.height();
    leftValue = trc_x - $img.width();


    // if image ends below bottom
    if($img.height() + relativeCursorPos.y > $(window).height()){
        topValue = topValue - $img.height() - (yOffset*2);
    }

    $img
        .css("top", topValue + "px")
        .css("left", leftValue + "px");
};

var setPicture = function(type, id, $img){
    fetchPicture(type, id).success(function(html){
        var imageSrc = $(html).find(linkTypes[type].posterSelector).attr('src') || linkTypes[type].anon;

        pictresCache[type+'-'+id] = imageSrc;
        setPictureSRC($img, imageSrc);

    }).complete(function(xhr, status){
        if(status == 'canceled'){
            setPictureSRC($img, pictresCache[type+'-'+id]);
        }
    });
};

var fetchPicture = function(type, id){
    ajaxRequest = $.ajax({
        url: "/"+ type +"/" + id,
        dataType: "html",
        beforeSend: function(xhr){
            if(pictresCache[type+'-'+id]){
                return false;
            }
        }
    });

    return ajaxRequest;
};

var setPictureSRC = function($img, url){
    $img.css({"padding":"0"});
    $img.attr('src', url).load(function() {
        calculatePreviewPosition();
    });
};

for (var type in linkTypes) {
    anchorSelector = "a[href^='/"+ type +"/']";
    $(document.body).on('hover mousemove', anchorSelector, setCoordinates);

    $(document.body).on('mouseenter', anchorSelector, createPreview);
    $(document.body).on('mousemove', anchorSelector, calculatePreviewPosition);
    $(document.body).on('mouseleave', anchorSelector, removePreview);
}

