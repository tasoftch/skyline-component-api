
import $ from "./jquery"

let _buttonHandler = (btn, cmd) => {
    if(btn.length > 0) {
        btn.forEach((b) => {
            if(b.api)
                b.api(cmd)
        });
    }
}

export const _defaultSettings = {
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
}

export const _defaultResponseHandlers = {
    'application/json': (xhr) => {
        let data = JSON.parse(xhr.responseText);

        if(!data.success) {
            throw data.errors[0];
        } else {
            return data;
        }
    },
    'text/html': (xhr) => {
        let html = xhr.responseText;
        if(html.substring(0, 18) === '## SKY_AUTOLOAD ##') {
            html = html.substring(18);
            $(document.body).append($(html));
        }
        return html;
    },
    'application/octet-stream': (xhr) => {
        return new Blob(xhr.response);
    },
    'default' : (xhr) => {
        return xhr.responseText;
    }
}


export default class Request {

    constructor(xhr, target) {
        this._settings = Object.assign({}, _defaultSettings);
        this._xhr = xhr;
        xhr.withCredentials = this._settings.withCredentials;
        this._target = target;
        this._successCallbacks = [];
        this._failCallbacks = [];
        this._uploadCallbacks = [];
        this._downloadCallbacks = [];
        this._doneCallbacks = [];
        this._buttons = [];
        this._authCallback = this._settings.authenticationHandler;
        this._setupEventHandlers(xhr);
        this.responseHandlers = _defaultResponseHandlers;
        this._data = false;
    }

    _trigger(handlers, ...args) {
        if(handlers !== undefined && handlers.length > 0) {
            handlers.forEach((h)=>{
                h(...args);
            });
        }
    }

    _progress(event, handlers) {
        var percent = 0;
        var position = event.loaded || event.position;
        var total = event.total;
        if (event.lengthComputable) {
            percent = Math.ceil(position / total * 100);
        }
        this._trigger(handlers, percent, position, total, event.lengthComputable);
    }

    _auth() {
        if(typeof this._authCallback === 'function') {
            this._authCallback({
                target: this._target,
                formData: this._data,
                cancel: (error) => {
                    this._trigger(this._failCallbacks, error);
                    this.afterHandler();
                },
                retry: (target, formData) => {
                    const xhr = this._settings.xhr();
                    if(!xhr) {
                        throw new Error("Could not create api call. No XHR instance could be created.");
                    }

                    const req = new Request(xhr, target&&target.length ?target: this._target);

                    req._successCallbacks = this._successCallbacks;
                    req._failCallbacks = this._failCallbacks;
                    req._uploadCallbacks = this._uploadCallbacks;
                    req._downloadCallbacks = this._downloadCallbacks;
                    req._doneCallbacks = this._doneCallbacks;
                    req._buttons = this._buttons;
                    req.responseHandlers = this.responseHandlers;

                    if(this._m === 'P') {
                        xhr.open("POST", req._target);
                        req.send(formData ? formData : this._data);
                    } else {
                        xhr.open("GET", req._target);
                        req.send();
                    }
                    return req;
                }
            });
            return true;
        }
        return false;
    }

    _load() {
        let ct = this._xhr.getResponseHeader('content-type');



        if(this._xhr.status === 401 && typeof this._authCallback === 'function') {
            if(this._auth())
                return;
        }

        try {
            for(let n in this.responseHandlers) {
                if(n === 'default' || ct.substr(0, n.length).toLowerCase() === n.toLowerCase()) {
                    let handler = this.responseHandlers[n];
                    if(typeof handler === 'function') {
                        this._trigger(this._successCallbacks, handler.call(this, this._xhr));
                        break;
                    }
                    throw new Error("Could not parse response.");
                }
            }
        } catch (err) {
            if(typeof err.code !== 'undefined' && err.code === 401) {
                if(this._auth())
                    return;
            }
            this._trigger(this._failCallbacks, err);
        }

        this.afterHandler();
    }

    _setupEventHandlers(xhr) {
        xhr.upload.addEventListener("progress", (event) => { this._progress(event, this._uploadCallbacks) });
        xhr.addEventListener("progress", (event) => { this._progress(event, this._downloadCallbacks) });
        xhr.addEventListener("load", this._load.bind(this));
        xhr.addEventListener("error", (err) => { this._trigger(this._failCallbacks, err) });
        xhr.addEventListener("abort", (err) => { this._trigger(this._failCallbacks, err) });
    }

    beforeHandler() {
        _buttonHandler(this._buttons, 'start');
    }

    afterHandler() {
        _buttonHandler(this._buttons, 'stop');
        this._trigger(this._doneCallbacks);
    }

    send(data) {
        window.setTimeout(()=>{
            this.beforeHandler();
            try {
                if(data) {
                    this._data = data;
                    this._xhr.send(data);
                }
                else
                    this._xhr.send();
            } catch (error) {
                this.afterHandler();
                this._trigger(this._failCallbacks, error);
            }
        }, 1);
    }

    button(btn) {
        if(typeof btn == "string" && $)
            btn = $(btn);
        if(btn)
            this._buttons.push(btn);
        return this;
    }


    success(callback) {
        if(callback && typeof callback === 'function')
            this._successCallbacks.push(callback);
        return this;
    }

    error(callback) {
        if(callback && typeof callback === 'function')
            this._failCallbacks.push(callback);
        return this;
    }

    upload(callback) {
        if(callback && typeof callback === 'function')
            this._uploadCallbacks.push(callback);
        return this;
    }

    download(callback) {
        if(callback && typeof callback === 'function')
            this._downloadCallbacks.push(callback);
        return this;
    }

    done(callback) {
        if(callback && typeof callback === 'function')
            this._doneCallbacks.push(callback);
        return this;
    }

    authenticator(callback) {
        this._authCallback = callback;
    }

    get target() {
        return this._target;
    }

    get settings() {
        return this._settings;
    }

    get data() {
        return this._data;
    }
}
