
import $ from "./jquery"

let _buttonHandler = (btn, cmd) => {
    if(btn.length > 0) {
        btn.forEach((b) => {
            if(b.api)
                b.api(cmd)
        });
    }
}

let _defaultSettings = {
    withCredentials : true,
    authenticationHandler: undefined
}

let _defaultResponseHandlers = {
    'application/json': (xhr) => {
        var data = JSON.parse(xhr.responseText);

        if(!data.success) {
            if(data.errors[0] && data.errors[0].code === 401) {
                if(this.settings.authenticationHandler) {
                    this.settings.authenticationHandler.call(this, data.errors[0]);
                    return false;
                }
            }

            throw data.errors[0];
        } else {
            return data;
        }
    },
    'default' : (xhr) => {
        return xhr.responseText;
    }
}


export default class Request {

    constructor(xhr, setup, target) {
        this._settings = Object.assign({}, _defaultSettings, setup);
        this._xhr = xhr;
        xhr.withCredentials = this._settings.withCredentials ? true : false;
        this._target = target;
        this._successCallbacks = [];
        this._failCallbacks = [];
        this._uploadCallbacks = [];
        this._downloadCallbacks = [];
        this._doneCallbacks = [];
        this._buttons = [];
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

    _load() {
        let ct = this._xhr.getResponseHeader('content-type');

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
