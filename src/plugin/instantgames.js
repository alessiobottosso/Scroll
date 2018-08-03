game.module(
    'plugin.instantgames'
)
.require(
    'engine.loader',
    'engine.renderer.texture',
    'engine.renderer.sprite'
)
.body(function() {

this.version = '1.3.2';

if (game.isStarted) return;

if (location.href.indexOf('fbsbx.com/instant') !== -1 || location.href.indexOf('source=fbinstant') !== -1 || window.instantGames) {
    // Game loaded from Instant Games platform
    game.device.instantGames = true;
    game.onReady = function() {
        var url = 'https://connect.facebook.net/en_US/fbinstant.6.2.js';
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = function() {
            game.start();
        };
        script.onerror = function() {
            throw 'Error loading script ' + url;
        };
        document.getElementsByTagName('head')[0].appendChild(script);
        return true;
    };
}
else {
    game.config.instantGames = game.config.instantGames || {};
    game.config.instantGames.debug = game.config.instantGames.debug || {};
    var MockConfig = game.config.instantGames.debug;

    if (typeof MockConfig.verbose === 'undefined') MockConfig.verbose = false;
    if (typeof MockConfig.player === 'undefined') MockConfig.player = 0;
    if (typeof MockConfig.context === 'undefined') MockConfig.context = 0;

    if (!MockConfig.players) {
        MockConfig.players = [
            {
                id: 1234,
                name: 'Player 1'
            },
            {
                id: 5678,
                name: 'Player 2'
            },
            {
                id: 6789,
                name: 'Player 3'
            },
            {
                id: 2345,
                name: 'Player 4'
            }
        ];
    }

    if (!MockConfig.contexts) {
        MockConfig.contexts = [
            {
                id: null,
                type: 'SOLO',
                size: 1
            },
            {
                id: 3456,
                type: 'THREAD',
                size: 2
            },
            {
                id: 5678,
                type: 'POST',
                size: 3
            },
            {
                id: 6789,
                type: 'GROUP',
                size: 4
            }
        ];
    }

    MockConfig.getPlayer = function(id) {
        if (typeof id === 'number') {
            for (var i = 0; i < MockConfig.players.length; i++) {
                if (MockConfig.players[i].id === id) return MockConfig.players[i];
            }
        }
        return MockConfig.players[MockConfig.player] || MockConfig.players[0];
    };

    MockConfig.getContext = function(id) {
        if (typeof id === 'number') {
            for (var i = 0; i < MockConfig.contexts.length; i++) {
                if (MockConfig.contexts[i].id === id) return MockConfig.contexts[i];
            }
        }
        else return MockConfig.contexts[MockConfig.context] || MockConfig.contexts[0];
    };

    var MockStore = game.Class.extend({
        status: 'ACTIVE',
        data: {},
        id: 1,

        init: function(name, id, data, status) {
            this.name = name;

            if (id) {
                this.id = id;
            }
            else {
                // Generate id
                var stores = localStorage.getItem('stores/' + FBInstant.context.getID());
                if (stores) stores = JSON.parse(stores);
                else stores = [];
                var ids = [];
                for (var i = 0; i < stores.length; i++) {
                    ids.push(stores[i].id);
                }
                while (ids.indexOf(this.id) !== -1) {
                    this.id++;
                }
            }
            
            this.data = data || this.data;
            this.status = status || this.status;
        },

        getID: function() {
            return this.id;
        },

        getName: function() {
            return this.name;
        },

        getStatus: function() {
            return this.status;
        },

        getDataAsync: function(params) {
            return new Promise(function(resolve, reject) {
                var stores = localStorage.getItem('stores/' + FBInstant.context.getID());
                if (stores) stores = JSON.parse(stores);
                else stores = [];

                for (var i = 0; i < stores.length; i++) {
                    if (stores[i].id === this.id) {
                        this.data = stores[i].data;
                    }
                }

                var response = {};
                for (var i = 0; i < params.length; i++) {
                    if (this.data[params[i]]) response[params[i]] = this.data[params[i]];
                }
                resolve(response);
            }.bind(this));
        },

        endAsync: function() {
            return new Promise(function(resolve, reject) {
                var stores = localStorage.getItem('stores/' + FBInstant.context.getID());
                if (stores) stores = JSON.parse(stores);
                else return resolve();

                for (var i = 0; i < stores.length; i++) {
                    if (stores[i].id === this.id) {
                        stores[i].status = 'ENDED';
                    }
                }

                localStorage.setItem('stores/' + FBInstant.context.getID(), JSON.stringify(stores));
                resolve();
            }.bind(this));
        },

        saveDataAsync: function(data) {
            return new Promise(function(resolve, reject) {
                this.data = data;

                var stores = localStorage.getItem('stores/' + FBInstant.context.getID());
                if (stores) stores = JSON.parse(stores);
                else stores = [];

                for (var i = 0; i < stores.length; i++) {
                    if (stores[i].id === this.id) {
                        stores[i].data = this.data;
                    }
                }

                localStorage.setItem('stores/' + FBInstant.context.getID(), JSON.stringify(stores));
                resolve();
            }.bind(this));
        },

        toJSON: function() {
            var json = {};
            json.name = this.name;
            json.id = this.id;
            json.data = this.data;
            json.status = this.status;
            return json;
        }
    });

    /*
     * Mocks for the FBInstant SDK methods
     */
    window.FBInstant = {
        __mockState: {
            initialized: false
        },
        player : {
            getName: function() {
                return Utils.returnUserData(MockConfig.getPlayer().name);
            },
            getPhoto: function() {
                Utils.log('player.getPhoto');
                return 'data:image/png;base64,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';
            },
            getID: function() {
                return Utils.returnUserData(MockConfig.getPlayer().id);
            },
            getDataAsync: function(keys) {
                Utils.log('player.getDataAsync');
                return Utils.getFromLocalStorage('playerData' + FBInstant.player.getID(), keys);
            },
            setDataAsync: function(obj) {
                Utils.log('player.setDataAsync');
                return Utils.writeToLocalStorage('playerData' + FBInstant.player.getID(), obj);
            },
            getStatsAsync: function(keys) {
                Utils.log('player.getStatsAsync');
                return Utils.getFromLocalStorage('playerStats' + FBInstant.player.getID(), keys);
            },
            setStatsAsync: function(obj) {
                Utils.log('player.setStatsAsync');
                return Utils.writeToLocalStorage('playerStats' + FBInstant.player.getID(), obj);
            },
            incrementStatsAsync: function(obj) {
                return new Promise(function(resolve, reject){
                    Utils.getFromLocalStorage('playerStats', Object.keys(obj))
                        .then(function(storedObject) {
                            for (var key in storedObject) {
                                storedObject[key] += obj[key];
                            }
                            Utils.writeToLocalStorage('playerStats', storedObject)
                                .then(function() {
                                    resolve();
                                });
                        });
                });
            },
            flushDataAsync: function(obj) {
                return new Promise(function(resolve, reject){
                    Utils.log('player.flushDataAsync');
                    resolve();
                });
            },
            getConnectedPlayersAsync: function() {
                return new Promise(function(resolve, reject){
                    var players = [];
                    var initialized = FBInstant.__mockState.initialized;
                    if (initialized) {
                        players = [
                            {
                                getID: function() { return 42 },
                                getName: function() { return 'Friend 1' },
                                getPhoto: function() { '/assets/mock/friend1.png'}
                            },
                            {
                                getID: function() { return 43 },
                                getName: function() { return 'Friend 2' },
                                getPhoto: function() { '/assets/mock/friend2.png'}
                            },
                            {
                                getID: function() { return 44 },
                                getName: function() { return 'Friend 3' },
                                getPhoto: function() { '/assets/mock/friend3.png'}
                            },
                        ];
                    } else {
                        Utils.log('getConnectedPlayersAsync', 'Connected players data is not available before startGameAsync resolves');
                    }
                    Utils.log('getConnectedPlayersAsync', 'players: ', players);
                    resolve(players);
                });
            },
            getSignedPlayerInfoAsync: function() {
                Utils.log('player.getSignedPlayerInfoAsync is not available in the Mock SDK. Please test this function with the production SDK')  
            }
        },
        context : {
            getID: function() {
                var id = MockConfig.getContext().id;
                Utils.log('context.getID', id);
                return id;
            },
            chooseAsync: function() {
                return new Promise(function(resolve, reject){
                    Utils.log('context.chooseAsync');
                    Utils.createAlert(
                        {
                            message:'Choosing a new context', 
                            cta:'Play!'
                        }, 
                        resolve
                    );
                });
            },
            switchAsync: function(contextId) {
                return new Promise(function(resolve, reject){
                    Utils.log('context.switchAsync');
                    Utils.createAlert(
                        {
                            message:'Switching to a new context ('+contextId+')',
                            cta:'Play!'
                        }, 
                        resolve
                    );
                });
            },
            createAsync: function(userId) {
                return new Promise(function(resolve, reject){
                    Utils.log('context.createAsync');
                    Utils.createAlert(
                        {
                            message:'Switching to a conversation with player '+ playerId,
                            cta:'Play!'
                        }, 
                        resolve
                    );
                });
            },
            getType: function() {
                var type = MockConfig.getContext().type || 'SOLO';
                Utils.log('context.getType', type);
                return type;
            },
            isSizeBetween: function(minSize, maxSize) {
                var size = MockConfig.getContext().size;
                var answer = false;
                minSize = minSize || 0;
                maxSize = maxSize || Infinity;
                if (size >= minSize && size <= maxSize) answer = true;
                return Utils.returnAndLog({
                    answer: answer,
                    minSize: minSize,
                    maxSize: maxSize
                });
            },
            getPlayersAsync: function() {
                return new Promise(function(resolve, reject){
                    var players = [];
                    var initialized = FBInstant.__mockState.initialized;
                    if (initialized) {
                        players = [
                            {
                                getID: function() { return 42 },
                                getName: function() { return 'Friend 1' },
                                getPhoto: function() { '/assets/mock/friend1.png'}
                            },
                            {
                                getID: function() { return 43 },
                                getName: function() { return 'Friend 2' },
                                getPhoto: function() { '/assets/mock/friend2.png'}
                            },
                            {
                                getID: function() { return 44 },
                                getName: function() { return 'Friend 3' },
                                getPhoto: function() { '/assets/mock/friend3.png'}
                            },
                        ];
                    } else {
                        Utils.log('context.getPlayersAsync', 'Connected players data is not available before startGameAsync resolves');
                    }
                    Utils.log('context.getPlayersAsync', 'players: ', players);
                    resolve(players);
                });
            },
            getStoresAsync: function(params) {
                return new Promise(function(resolve, reject) {
                    var response = [];
                    var stores = localStorage.getItem('stores/' + FBInstant.context.getID());
                    if (stores) {
                        stores = JSON.parse(stores);
                        for (var i = 0; i < stores.length; i++) {
                            var store = stores[i];
                            if (params.status && params.status !== store.status) continue;
                            response.push(new MockStore(store.name, store.id, store.data, store.status));
                        }
                    }

                    resolve(response);
                });
            },
            createStoreAsync: function(name) {
                return new Promise(function(resolve, reject) {
                    var store = new MockStore(name);

                    // Save new store
                    var stores = localStorage.getItem('stores/' + FBInstant.context.getID());
                    if (stores) stores = JSON.parse(stores);
                    else stores = [];
                    stores.push(store.toJSON());
                    localStorage.setItem('stores/' + FBInstant.context.getID(), JSON.stringify(stores));

                    resolve(store);
                });
            }
        },

        getLocale: function() {
            return 'en_US';
        },

        initializeAsync: function() {
            return new Promise(function(resolve, reject) {
                // Append Mock CSS
                var css = '.mockDialog { padding-left: 20px; padding-right: 20px; padding-bottom: 20px; background-color: #fff; color:#000; font-family: \'Helvetica\'; position: absolute; left: 30%; top: 45%; float:left; border: 2px solid #3b5998; box-shadow: 5px 5px 2px #888888; } .mockDialog h3 { color:#00f; } .mockDialog p { color:#000; } .mockDialog input { background-color: #3b5998; color: #fff; }';
                var node = document.createElement('style');
                node.innerHTML = css;
                document.body.appendChild(node);

                Utils.log('initializeAsync');
                resolve();
            });
        },

        checkCanPlayerMatchAsync: function() {
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
        },

        setLoadingProgress: function(progress) {
            return new Promise(function(resolve, reject) {
                Utils.log('progress', progress, '%');
                resolve();
            });
        },

        startGameAsync: function() {
            return new Promise(function(resolve, reject){
                Utils.log('startGameAsync', 'Showing game start dialog');
                FBInstant.__mockState.initialized = true;
                resolve();
                return;
                Utils.createAlert(
                    {
                        message:'Game has finished loading. <br /> Play now?', 
                        cta: 'Play!'
                    }, 
                    function() {
                        FBInstant.__mockState.initialized = true;
                        resolve();
                    }
                );
            });
        },

        quit: function() {
            Utils.log('QUIT was called. At this point the game will exit');
        },

        updateAsync: function(config) {
            return new Promise(function(resolve, reject){
                Utils.log('updateAsync');
                if (config.image) {
                    resolve();
                } else {
                    reject();
                }
            });
        },

        getEntryPointData: function() {
            var data = MockConfig.entryPointData || {};
            Utils.log('getEntryPointData', data);
            return data;
        },

        getEntryPointAsync: function() {
            return new Promise(function(resolve, reject){
                resolve('admin_message');
            });
        },

        setSessionData: function(object) {
            FBInstant.log('setSessionData', 'Object to be persisted', object, '(Please note, while using the mock SDK, setSessionData will have no effect.)')
        },

        getPlatform: function() {
            return 'WEB';
        },

        getSDKVersion: function() {
            return '6.0';
        },

        getSupportedAPIs: function() {
            var supportedAPIs = [];
            for (var prop in FBInstant) {
                supportedAPIs.push(prop);
            }
            for (var prop in FBInstant.player) {
                supportedAPIs.push('player.' + prop);
            }
            for (var prop in FBInstant.context) {
                supportedAPIs.push('context.' + prop);
            }
            return supportedAPIs;
        },

        shareAsync: function(options) {
            var message = 'Share Intent: ' + options.intent;
            message += '<br />';
            message += 'Share text: ' + options.text;
            message += '<br />';
            message += 'Share payload: ' + JSON.stringify(options.data);

            return new Promise(function(resolve, reject) {
                Utils.createAlert(
                    {
                        title: 'Shared content',
                        message: message,
                        image: options.image,
                        cta: 'Close'
                    }, 
                    resolve
                );
            });
        },

        logEvent: function(eventName, value, parameters) {
            Utils.log('logEvent', eventName, value, parameters);
            return null;
        },

        onPause: function(callback) {
            window.addEventListener('blur', function() {
                Utils.log('onPause', 'Interruption event triggered');
                callback();
            });
        }
    };

    /* 
     * Helper Functions
     */
    var Utils = {
        createAlert: function(options, callback) {
            var alertDiv = document.createElement('div');
            alertDiv.className = 'mockDialog';

            var title = document.createElement('h3');
            title.innerHTML = '(FBInstant Mock)'
            title.innerHTML += ' ' + (options.title || '');
            alertDiv.appendChild(title);

            if (options.message) {
                var paragraph = document.createElement('p');
                paragraph.innerHTML = options.message;
                alertDiv.appendChild(paragraph);            
            }

            if (options.image) {
                var image = document.createElement('img');
                image.src = options.image;
                alertDiv.appendChild(image);
            }

            var button = document.createElement('input');
            button.type = 'button';
            button.value = options.cta || 'Close';
            alertDiv.appendChild(button);
        

            button.onclick = function() {
                document.body.removeChild(alertDiv);
                callback();
            }

            document.body.appendChild(alertDiv);
        },
        log: function() {
            if (MockConfig.verbose) {
                args = [];
                args.push('[FBInstant Mock]:');
                for( var i = 0; i < arguments.length; i++ ) {
                    args.push(arguments[i]);
                }
                console.log.apply(console, args);
            }
        },
        getQueryString: function() {
            var qd = {};
            if (location.search) location.search.substr(1).split("&").forEach(function(item) {
                var s = item.split("="),
                    k = s[0],
                    v = s[1] && decodeURIComponent(s[1]); 
                (qd[k] = qd[k] || []).push(v) 
            });
            return qd;
        },
        returnAndLog: function(value) {
            caller = Utils.returnAndLog.caller;
            if (caller) {
                Utils.log(caller.name, value);
            } else {
                Utils.log(value);
            }
            return value;
        },
        returnUserData: function(value) {
            var initialized = FBInstant.__mockState.initialized;
            if (initialized) {
                return Utils.returnAndLog(value);
            } else {
                Utils.log('User Data is not available until startGameAsync has resolved');
                return null;
            }
        },
        getFromLocalStorage: function(store, keys) {
            return new Promise(function(resolve, reject){
                var data = localStorage.getItem(store);
                var response = {};
                if (data) {
                    data = JSON.parse(data);
                    keys.forEach(function(key){
                        if (data[key]) {
                            response[key] = data[key];
                        }
                    })
                }
                Utils.log(response);
                resolve(response);
            });
        },
        writeToLocalStorage: function(store, obj) {
            return new Promise(function(resolve, reject){
                Utils.log(JSON.stringify(obj));
                localStorage.setItem(store, JSON.stringify(obj));
                resolve();
            });
        }
    };
}

// Panda 2 code

/**
    Instant Games ads class for both Interstitial and Rewared Video ads.
    @class InstantAd
    @constructor
    @param {String} id Ad placement id
**/
game.createClass('InstantAd', {
    staticInit: function(id) {
        this.id = id;
    },

    /**
        Called, when ad is ready to be displayed.
        @method onReady
        @param {String} error
    **/
    onReady: function(error) {},

    /**
        Load ad.
        @method load
    **/
    load: function() {
        game.InstantAd._requestAd(this.id, this.onReady.bind(this));
    },

    /**
        Show ad.
        @method show
        @param {Function} callback Called when player returns to game from ad.
    **/
    show: function(callback) {
        game.InstantAd._showAd(this.id, callback);
    }
});

game.addAttributes('InstantAd', {
    /**
        Request ads automatically, when game is launched.
        @attribute {Boolean} autoLoad
        @default true
    **/
    autoLoad: true,
    /**
        Request new ad instance automatically, after ad is displayed.
        @attribute {Boolean} autoReload
        @default true
    **/
    autoReload: true,
    /**
        List of placement id's for Interstitial ads.
        @attribute {Array} interstitial
    **/
    interstitial: [],
    /**
        List of placement id's for Rewarded Video ads.
        @attribute {Array} rewarded
    **/
    rewarded: [],
    /**
        Cache for all ad instances.
        @attribute {Object} cache
    **/
    cache: {},

    _loaded: [],

    _requestAds: function() {
        var supportedAPIs = FBInstant.getSupportedAPIs();

        if (supportedAPIs.indexOf('getInterstitialAdAsync') !== -1) {
            for (var i = 0; i < this.interstitial.length; i++) {
                this._requestAd(this.interstitial[i]);
            }
        }
        if (supportedAPIs.indexOf('getRewardedVideoAsync') !== -1) {
            for (var i = 0; i < this.rewarded.length; i++) {
                this._requestAd(this.rewarded[i]);
            }
        }
    },

    _requestAd: function(id, callback) {
        var func;
        if (this.interstitial.indexOf(id) !== -1) func = 'getInterstitialAdAsync';
        else if (this.rewarded.indexOf(id) !== -1) func = 'getRewardedVideoAsync';
        if (!func) return this._callback(callback, 'No ad defined for placement id ' + id);
        if (FBInstant.__mockState) {
            console.warn('Ads not available on mock SDK');
            return;
        }
        // Ad already requested
        if (this.cache[id]) {
            // Ad already loaded
            if (this._loaded.indexOf(id) !== -1) this._callback(callback);
            else this._loadAd(id, callback);
        }
        else {
            FBInstant[func](id).then(this._adRequested.bind(this, id, callback)).catch(this._adRequestError.bind(this, callback));
        }
    },

    _adRequestError: function(callback, error) {
        this._callback(callback, error);
    },

    _adRequested: function(id, callback, ad) {
        this.cache[id] = ad;
        this._loadAd(id, callback);
    },

    _loadAd: function(id, callback) {
        var ad = this.cache[id];
        if (!ad) return this._callback(callback, 'No ad requested for placement id ' + id);
        this._loaded.erase(id);
        ad.loadAsync().then(this._adLoaded.bind(this, id, callback)).catch(this._adLoadError.bind(this, callback));
    },

    _adLoaded: function(id, callback) {
        var ad = this.cache[id];
        this._loaded.push(id);
        this._callback(callback);
    },

    _adLoadError: function(callback, error) {
        this._callback(callback, error);
    },

    _showAd: function(id, callback) {
        var ad = this.cache[id];
        if (!ad) return this._callback(callback, 'Ad not found');
        if (this._loaded.indexOf(id) === -1) this._callback(callback, 'Ad not loaded');

        delete this.cache[id];
        ad.showAsync().then(this._adShowEnd.bind(this, id, callback)).catch(this._adShowError.bind(this, callback));
    },

    _adShowEnd: function(id, callback) {
        this._callback(callback);
        if (this.autoReload) this._requestAd(id);
    },

    _adShowError: function(callback, error) {
        this._callback(callback, error);
    },

    _callback: function(callback, message) {
        if (typeof callback === 'function') callback(message);
    }
});

/**
    Special Sprite class for Facebook profile photos.
    @class PlayerPhoto
    @constructor
    @param {String} texture Url of the photo
    @param {Number} size Size where the photo is resized
    @param {Boolean} [useMask] Mask photo into circle shape
**/
game.createClass('PlayerPhoto', 'Sprite', {
    init: function(texture, size, useMask) {
        size = size || 200;
        this.useMask = useMask;
        if (this.texture.baseTexture.loaded) this._setSize(size);
        else this.texture.baseTexture._loadCallback = this._setSize.bind(this, size);
    },

    /**
        Called, when photo is loaded.
        @method onLoad
    **/
    onLoad: function() {},
    
    /**
        @method _setSize
        @param {Number} size
        @private
    **/
    _setSize: function(size) {
        this.onLoad();
        this.scale.x = size / this.texture.baseTexture.width;
        this.scale.y = size / this.texture.baseTexture.height;
        if (this.useMask) {
            var maskSize = this.texture.baseTexture.width / 2;
            var mask = new game.Graphics();
            mask.drawCircle(maskSize, maskSize, maskSize);
            this.mask = mask;
        }
    }
});

game.onStart = function() {
    FBInstant.initializeAsync()
    .then(function() {
        game.FBInstantInited = true;
        game.onFBInstantInited();
    }).catch(function(error) {
        console.log(error);
    });
    game.system.setScene('InstantLoader', game.System.startScene);
};

game.onFBInstantInited = function() {};
game.onFBInstantStarted = function() {};

game.InstantLoader = game.Loader.extend({
    init: function() {
        if (FBInstant.__mockState) this.super();
        else this.backgroundColor = game.Loader.backgroundColor;
    },

    onComplete: function() {
        if (!game.FBInstantInited) {
            game.Timer.add(100, this.onComplete.bind(this));
        }
        else {
            FBInstant.startGameAsync().then(this.onInstantReady.bind(this)).catch(function(error) {
                console.log(error);
            });
        }
    },

    onInstantComplete: function() {
        game.system.setScene(this.scene);
    },

    onInstantReady: function() {
        game.onFBInstantStarted();
        if (game.InstantAd.autoLoad) game.InstantAd._requestAds();
        var photo = FBInstant.player.getPhoto();
        if (!photo) return this.onInstantComplete();
        // Automatically load player photo with id playerPhoto
        game.addAsset(photo, 'playerPhoto');
        this.loadImage(game.mediaQueue[0], this.onInstantComplete.bind(this));
        game.mediaQueue.length = 0;
    },

    onProgress: function() {
        if (FBInstant.__mockState) this.super();
        FBInstant.setLoadingProgress(this.percent);
    }
});

game.BaseTexture.crossOrigin = 'anonymous';

});
