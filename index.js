'use strict';

module.exports = skema;
skema.Skema = Skema;

var node_path = require('path');
var node_url = require('url');

function skema (attrs, options){
    return new Skema(attrs, options);
};


// @param {Object} attrs list of attr(see `this.add`)
// @param {Object} options
// - host: {Object} host object
function Skema(attrs, options) {
    options = options || {};
    this.host = options.context || this;
    this.__attrs = {};

    this.key_list = [];

    var key;

    for(key in attrs){
        this.add(key, attrs[key]);
    }
}

var TYPES = {
    path: {
        validator: function (v) {
            return v || v === '';
        },

        setter: function (v) {
            return node_path.resolve( String(v) );
        }
    },

    url: {
        validator: function (v) {
            return !!node_url.parse(v).host;
        }
    }
};


[Number, String, Boolean].forEach(function (constructor) {
    var name = constructor.name.toLowerCase();

    TYPES[name] = {
        setter: function (v) {
            return constructor(v);
        }
    }
});


// Object.defineProperties(Skema, 'TYPES', {
//     value: TYPES
// });

Skema.TYPES = TYPES;

// TODO
// [Array, Function, ].


Skema.prototype = {
    _get: function (key) {
        var attr = this.__attrs[key];

        if(!attr){
            return;
        }

        var getter = attr.type.getter;
        var value = attr.value;
    
        return getter ?
              // getter could based on the value of the current value
            getter.call(this.host, value, key, this) :
            value;
    },

    get: function (key) {
        if(arguments.length === 0){
            var ret = {};
            var self = this;

            // if get all values, only get enumerable properties
            this.enumerable().forEach(function (key) {
                ret[key] = self._get(key);
            });

            return ret;
        }else{
            return this._get(key);
        }
    },

    // Reset to default value.
    // Run this method will execute setup methods
    reset: function (key) {
        if(arguments.length === 0){
            // reset all values, including non-enumerable and readonly properties
            this.key_list.forEach(function (key) {
                this._reset(key);
            }, this);
        
        }else{
            this._reset(key);
        }
    },

    // Force to unsetting a value by key,
    // use this method carefully.
    _reset: function (key) {
        var attr = this.__attrs[key];

        if(!attr){
            return;
        }

        var value = attr.value = attr._origin;
        var setup = attr.type.setup; 

        if(setup){
            setup.call(this.host, value, key, this);
        }
    },

    enumerable: function () {
        var attrs = this.__attrs;

        return this.key_list.filter(function (key) {
            var attr = attrs[key];

            return attr.enumerable ||
                // Or not specified (default to true)
                !('enumerable' in attr)
        });
    },

    writable: function () {
        var attrs = this.__attrs;

        return this.key_list.filter(function (key) {
            var attr = attrs[key];

            return attr.writable ||
                !('writable' in attr)
        });
    },

    // @param {boolean=} ghost, ghost set, skip validation
    _set: function (key, value, ghost) {
        var attr = this.__attrs[key];
        var is_success = false;

        // for inner use
        if(ghost){
            attr.value = value;
            return;
        }

        if(!attr){
            return is_success;
        }

        // `attr.writable` is `true` by default
        if(!attr.writable && 'writable' in attr){
            return is_success;
        }

        // reset error status
        delete this._err;

        var validator = attr.type.validator;

        if(!validator || validator.call(this.host, value, key, this)){

            // validator returns true, but there might be error messages
            if( is_success = !this._err ){
                var setter = attr.type.setter;

                if(setter){
                    value = setter.call(this.host, value, key, this);

                    is_success = !this._err;
                }
            }
        // validator returns false
        }else{
            is_success = false;
        }

        if(is_success){
            attr.value = value;
        }

        return is_success;
    },

    set: function (key, value) {
        if(Object(key) === key){
            var list = key;
            var is_success = true;
            var errors = {};
            var result;

            for(key in list){
                value = list[key];
                is_success = this._set(key, value) && is_success;
            }

            return is_success;

        }else if(typeof key === 'string'){
            return this._set(key, value);

        }else{
            return false;
        }
    },

    // @param {Object} attr
    // - value: {mixed} default value
    // - type:
    add: function (key, attr) {
        if(key in this.__attrs){
            return;
        }

        // save the original value
        attr._origin = attr.value;

        attr = attr || {};

        var type = attr.type || {};

        if(typeof type === 'string'){
            type = Skema.TYPES[type];
        }

        if(Object(type) !== type){
            return;
        }

        this.key_list.push(key);
        attr.type = type;

        this.__attrs[key] = attr;
        this.reset(key);

        return true;
    },

    error: function () {
        this._err = true;
    }
};
