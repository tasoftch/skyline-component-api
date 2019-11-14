<?php
use Skyline\Kernel\Service\CORSService;
?>
/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2019, TASoft Applications
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
if(jQuery !== undefined) {
    (function($) {
        if(!window.Skyline)
            window.Skyline = {};

        window.Skyline.API = {
            HOST_PREFIX : "<?= CORSService::getHostByLabel("API") ?>",
            get:function(apiTarget) {
                var xhr = this.setup.xml();
                var req = new this.Request(xhr, this.setup);

                xhr.open("GET", this.HOST_PREFIX + apiTarget);

                window.setTimeout(function() {
                    req.beforeHandler();
                    xhr.send();
                }, 1);

                return req;
            },
            post:function(apiTarget, formData) {
                var xhr = this.setup.xml();
                var req = new this.Request(xhr, this.setup);

                xhr.open("POST", this.HOST_PREFIX + apiTarget);

                window.setTimeout(function() {
                    req.beforeHandler();
                    try {
                        xhr.send(formData);
                    } catch (error) {
                        for(var e=0;e<that.failCallbacks.length;e++) {
                            that.failCallbacks[e].call(that, error);
                        }
                    }
                }, 1);

                return req;
            },
            setup : {
                xml:function() {
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
                withCredentials : true
            },
            Request: function(xhr, setup) {
                var key;
                for(key in setup) {
                    eval("xhr."+key+ " = setup."+key+";");
                }
                this.successCallbacks = [];
                this.failCallbacks = [];
                this.uploadCallbacks = [];
                this.downloadCallbacks = [];
                this.doneCallbacks = [];
                this.buttons = [];

                this.xhr = xhr;
                var that = this;

                xhr.upload.addEventListener("progress", function(event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }

                    for(var e=0;e<that.uploadCallbacks.length;e++) {
                        that.uploadCallbacks[e].call(that, percent, position, total, event.lengthComputable);
                    }
                });
                xhr.addEventListener("progress", function(event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }

                    for(var e=0;e<that.downloadCallbacks.length;e++) {
                        that.downloadCallbacks[e].call(that, percent, position, total, event.lengthComputable);
                    }
                });

                var failedHandler = function(error) {
                    for(var e=0;e<that.failCallbacks.length;e++) {
                        that.failCallbacks[e].call(that, error);
                    }
                };

                xhr.addEventListener("load", function() {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if(data.api_modal_response) {
                            $(document.body).append( data.api_modal_response );
                            if(data.api_modal_response_stop) {
                                that.afterHandler();
                                return;
                            }
                        }

                        if(!data.success) {
                            if(data.api_validation_name) {
                                var el = document.getElementById(data.api_validation_name);
                                if(el) {
                                    if(data.api_modal_response_id) {
                                        $('#'+data.api_modal_response_id).on("hidden.bs.modal", function() {
                                            el.focus();
                                        });
                                        that.afterHandler();
                                        return;
                                    } else {
                                        el.focus();
                                    }
                                }
                            }
                            failedHandler(data.errors[0]);
                        } else {
                            for(var e=0;e<that.successCallbacks.length;e++) {
                                that.successCallbacks[e].call(that, data);
                            }
                        }
                    } catch(err) {
                        failedHandler(err);
                    }

                    that.afterHandler();
                });
                xhr.addEventListener("error", function(evt) {
                    failedHandler(evt);
                    that.afterHandler();
                });
                xhr.addEventListener("abort", function(evt) {
                    failedHandler(evt);
                    that.afterHandler();
                });
            }
        };
        window.Skyline.API.Request.prototype.success = function(callback) {
            if(callback && typeof callback === 'function')
                this.successCallbacks.push(callback);
            return this;
        }
        window.Skyline.API.Request.prototype.error = function(callback) {
            if(callback && typeof callback === 'function')
                this.failCallbacks.push(callback);
            return this;
        }
        window.Skyline.API.Request.prototype.upload = function(callback) {
            if(callback && typeof callback === 'function')
                this.uploadCallbacks.push(callback);
            return this;
        }
        window.Skyline.API.Request.prototype.download = function(callback) {
            if(callback && typeof callback === 'function')
                this.downloadCallbacks.push(callback);
            return this;
        }
        window.Skyline.API.Request.prototype.done = function(callback) {
            if(callback && typeof callback === 'function')
                this.doneCallbacks.push(callback);
            return this;
        }
        window.Skyline.API.Request.prototype.button = function(idOrBtn) {
            if(typeof idOrBtn == "string")
                idOrBtn = $(idOrBtn);
            if(idOrBtn)
                this.buttons.push(idOrBtn);
            return this;
        }
        window.Skyline.API.Request.prototype.beforeHandler = function() {
            for(var e=0;e<this.buttons.length;e++) {
                var btn = this.buttons[e];
                if(btn.api)
                    btn.api("start");
            }
        }
        window.Skyline.API.Request.prototype.afterHandler = function() {
            for(var e=0;e<this.doneCallbacks.length;e++) {
                this.doneCallbacks[e].call(this);
            }

            for(e=0;e<this.buttons.length;e++) {
                var btn = this.buttons[e];
                if(btn.api)
                    btn.api("stop");
            }
        }
        $.fn.api = function(cmd) {
            if(cmd == 'start') {
                this.addClass("api-loading");
            }
            if(cmd == 'stop') {
                this.removeClass("api-loading");
            }
        }
    })(jQuery);
} else {
    console.error("Skyline API requires jQuery");
}