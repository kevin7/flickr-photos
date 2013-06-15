/*global jQuery*/


/* Module design pattern */

var setupPhotos = (function ($) {

    function each (items, callback) {

        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

		//items are storing image path from flickr
		//this function merges each items of each tags into a single array 
    function flatten (items) {    
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function imageAppender (id) {

        var holder = document.getElementById(id);
        return function (img) {
            var elm = document.createElement('div');
            elm.className = 'photo photo-' + photo_id;

		    		var fav = document.createElement('a');
		    		fav.className = 'fav icon-heart-empty';                                              		    		
            fav.id = 'photo-' + photo_id;    	
            
            //image path is used to uniquely identify each image coming from flickr
            //this to ensure correct images are being liked
            fav.href = $(img).attr('src');
            
            elm.appendChild(fav);
            elm.appendChild(img);

            holder.appendChild(elm);
            
            applyCookie($(img).attr('src'), 'photo-' + photo_id);
            photo_id++;
        };
    }
    
    //Add click event to the like/unlike link
    function eventHandler() {
    
    	$('.fav').live('click', function () {
    		    	
	    	var cur = $(this),
	    			parent = $(this).parent();
	    	
	    	if (cur.hasClass('fav-active')) {
					unlikePhoto(cur);    	
	    	} else {
					likePhoto(cur);
	    	}
	    	
	    	return false;
				
    	});
    }
    
    function likePhoto(photo_id) {
  		photo_id.removeClass('icon-heart-empty');	    	
  		photo_id.addClass('icon-heart fav-active');	    	    
  		createCookie(photo_id.attr('href'), 1, 365);
    }

    function unlikePhoto(photo_id) {
  		photo_id.removeClass('icon-heart fav-active');
  		photo_id.addClass('icon-heart-empty');	        
  		eraseCookie(photo_id.attr('href'));
    }
    
    function applyCookie(path, photo_id) {
    	if (readCookie(path) == 1) {
				likePhoto($('#' + photo_id));
    	}
    }

		//create, read and write functions for cookie manipulation
		function createCookie(name,value,days) {
		    if (days) {
		        var date = new Date();
		        date.setTime(date.getTime()+(days*24*60*60*1000));
		        var expires = "; expires="+date.toGMTString();
		    }
		    else var expires = "";
		    document.cookie = name+"="+value+expires+"; path=/";
		}
		
		function readCookie(name) {
		    var nameEQ = name + "=";
		    var ca = document.cookie.split(';');
		    for(var i=0;i < ca.length;i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') c = c.substring(1,c.length);
		        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		    }
		    return null;
		}
		
		function eraseCookie(name) {
		    createCookie(name,"",-1);
		}    

    // ----
    
    var max_per_tag = 5;
    var photo_id = 1;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            eventHandler();
            callback();
        });
    };
}(jQuery));
