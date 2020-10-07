
import API from "./API";

(function($, Skyline) {
    Skyline.API = API;

    $.fn.api = function(cmd) {
        if(cmd === 'start') {
            this.addClass("api-loading");
        }
        if(cmd === 'stop') {
            this.removeClass("api-loading");
        }
    }
})(window.jQuery, window.Skyline);
