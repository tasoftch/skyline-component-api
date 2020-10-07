
import Request from "./Request";



export default {
    setup : {
        xhr:function() {
            if (window.XMLHttpRequest) {
                // Chrome, Firefox, IE7+, Opera, Safari
                return new XMLHttpRequest();
            }
            // IE6
            try {
                return new ActiveXObject('MSXML2.XMLHTTP.6.0');
            } catch (e) {
                try {
                    // The fallback.
                    return new ActiveXObject('MSXML2.XMLHTTP.3.0');
                } catch (e) {
                    console.error('This browser is not AJAX enabled.');
                    return null;
                }
            }
        },
        withCredentials : true,
        authenticationHandler: undefined
    },

    makeTarget: function(target) {
        if(/^https?/i.test(target))
            return target;
        return this.HOST_PREFIX ? this.HOST_PREFIX + target : target;
    },
    get:function(apiTarget) {
        let xhr = this.setup.xhr();
        if(!xhr) {
            throw new Error("Could not create api call. No XHR instance could be creted.");
        }
        let tg;
        var req = new Request(xhr, this.setup, tg = this.makeTarget(apiTarget));

        xhr.open("GET", tg);
        req.send();
        return req;
    },
    post:function(apiTarget, formData) {
        if(!(formData instanceof FormData)) {
            var fd = new FormData();
            for(let k in formData) {
                if(formData.hasOwnProperty(k))
                    fd.append(k, formData[k]);
            }
            formData = fd;
        }

        let xhr = this.setup.xhr();
        if(!xhr) {
            throw new Error("Could not create api call. No XHR instance could be creted.");
        }
        let tg;
        var req = new Request(xhr, this.setup, tg = this.makeTarget(apiTarget));

        xhr.open("POST", tg);
        xhr.send(formData);

        return req;
    }
};
