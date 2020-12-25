
import Request, {_defaultResponseHandlers, _defaultSettings} from "./Request";



export default {
    responseHandlers: _defaultResponseHandlers,
    setup : _defaultSettings,

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
        var req = new Request(xhr, tg = this.makeTarget(apiTarget));
        req._m = 'G';

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

        if(this.CSRF_TOKEN_NAME && this.CSRF_TOKEN)
            formData.append(this.CSRF_TOKEN_NAME, this.CSRF_TOKEN);


        let xhr = this.setup.xhr();
        if(!xhr) {
            throw new Error("Could not create api call. No XHR instance could be creted.");
        }
        let tg;
        var req = new Request(xhr, tg = this.makeTarget(apiTarget));
        req._m = 'P';

        xhr.open("POST", tg);
        req.send(formData);

        return req;
    }
};
