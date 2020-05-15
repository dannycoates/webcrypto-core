// Copyright (c) 2017, Peculiar Ventures, All rights reserved.

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_1 = require('tslib');

function printf(text) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var msg = text;
    var regFind = /[^%](%\d+)/g;
    var match;
    var matches = [];
    while (match = regFind.exec(msg)) {
        matches.push({ arg: match[1], index: match.index });
    }
    for (var i = matches.length - 1; i >= 0; i--) {
        var item = matches[i];
        var arg = item.arg.substring(1);
        var index = item.index + 1;
        msg = msg.substring(0, index) + arguments[+arg] + msg.substring(index + 1 + arg.length);
    }
    msg = msg.replace("%%", "%");
    return msg;
}
var WebCryptoError = (function (_super) {
    tslib_1.__extends(WebCryptoError, _super);
    function WebCryptoError(template) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.code = 0;
        _this.message = printf.apply(void 0, [template].concat(args));
        var error = new Error(_this.message);
        error.name = _this.constructor.name;
        _this.stack = error.stack;
        return _this;
    }
    WebCryptoError.NOT_SUPPORTED = "Method is not supported";
    return WebCryptoError;
}(Error));
var AlgorithmError = (function (_super) {
    tslib_1.__extends(AlgorithmError, _super);
    function AlgorithmError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 1;
        return _this;
    }
    AlgorithmError.PARAM_REQUIRED = "Algorithm hasn't got required paramter '%1'";
    AlgorithmError.PARAM_WRONG_TYPE = "Algorithm has got wrong type for paramter '%1'. Must be %2";
    AlgorithmError.PARAM_WRONG_VALUE = "Algorithm has got wrong value for paramter '%1'. Must be %2";
    AlgorithmError.WRONG_ALG_NAME = "Algorithm has got wrong name '%1'. Must be '%2'";
    AlgorithmError.UNSUPPORTED_ALGORITHM = "Algorithm '%1' is not supported";
    AlgorithmError.WRONG_USAGE = "Algorithm doesn't support key usage '%1'";
    return AlgorithmError;
}(WebCryptoError));
var CryptoKeyError = (function (_super) {
    tslib_1.__extends(CryptoKeyError, _super);
    function CryptoKeyError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 3;
        return _this;
    }
    CryptoKeyError.EMPTY_KEY = "CryptoKey is empty";
    CryptoKeyError.WRONG_KEY_ALG = "CryptoKey has wrong algorithm '%1'. Must be '%2'";
    CryptoKeyError.WRONG_KEY_TYPE = "CryptoKey has wrong type '%1'. Must be '%2'";
    CryptoKeyError.WRONG_KEY_USAGE = "CryptoKey has wrong key usage. Must be '%1'";
    CryptoKeyError.NOT_EXTRACTABLE = "CryptoKey is not extractable";
    CryptoKeyError.WRONG_FORMAT = "CryptoKey has '%1' type. It can be used with '%2' format";
    CryptoKeyError.UNKNOWN_FORMAT = "Unknown format in use '%1'. Must be one of 'raw', 'pkcs8', 'spki'  or 'jwk'";
    CryptoKeyError.ALLOWED_FORMAT = "Wrong format value '%1'. Must be %2";
    return CryptoKeyError;
}(WebCryptoError));

function PrepareAlgorithm(alg) {
    var res;
    if (typeof alg === "string") {
        res = { name: alg };
    }
    else {
        res = alg;
    }
    BaseCrypto.checkAlgorithm(res);
    var hashedAlg = alg;
    if (hashedAlg.hash) {
        hashedAlg.hash = PrepareAlgorithm(hashedAlg.hash);
    }
    return res;
}
function PrepareData(data, paramName) {
    if (!data) {
        throw new WebCryptoError("Parameter '" + paramName + "' is required and cant be empty");
    }
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
        return new Uint8Array(data);
    }
    if (ArrayBuffer.isView(data)) {
        var copy = data.map(function (i) { return i; });
        return new Uint8Array(copy.buffer);
    }
    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }
    throw new WebCryptoError("Incoming parameter '" + paramName + "' has wrong data type. Must be ArrayBufferView or ArrayBuffer");
}
var BaseCrypto = (function () {
    function BaseCrypto() {
    }
    BaseCrypto.checkAlgorithm = function (alg) {
        if (typeof alg !== "object") {
            throw new TypeError("Wrong algorithm data type. Must be Object");
        }
        if (!alg.name) {
            throw new AlgorithmError(AlgorithmError.PARAM_REQUIRED, "name");
        }
    };
    BaseCrypto.checkAlgorithmParams = function (alg) {
        this.checkAlgorithm(alg);
    };
    BaseCrypto.checkKey = function (key, alg, type, usage) {
        if (type === void 0) { type = null; }
        if (usage === void 0) { usage = null; }
        if (!key) {
            throw new CryptoKeyError(CryptoKeyError.EMPTY_KEY);
        }
        var keyAlg = key.algorithm;
        this.checkAlgorithm(keyAlg);
        if (alg && (keyAlg.name.toUpperCase() !== alg.toUpperCase())) {
            throw new CryptoKeyError(CryptoKeyError.WRONG_KEY_ALG, keyAlg.name, alg);
        }
        if (type && (!key.type || key.type.toUpperCase() !== type.toUpperCase())) {
            throw new CryptoKeyError(CryptoKeyError.WRONG_KEY_TYPE, key.type, type);
        }
        if (usage) {
            if (!key.usages.some(function (keyUsage) { return usage.toUpperCase() === keyUsage.toUpperCase(); })) {
                throw new CryptoKeyError(CryptoKeyError.WRONG_KEY_USAGE, usage);
            }
        }
    };
    BaseCrypto.checkWrappedKey = function (key) {
        if (!key.extractable) {
            throw new CryptoKeyError(CryptoKeyError.NOT_EXTRACTABLE);
        }
    };
    BaseCrypto.checkKeyUsages = function (keyUsages) {
        if (!keyUsages || !keyUsages.length) {
            throw new WebCryptoError("Parameter 'keyUsages' cannot be empty.");
        }
    };
    BaseCrypto.checkFormat = function (format, type) {
        switch (format.toLowerCase()) {
            case "raw":
                if (type && type.toLowerCase() !== "secret" && type && type.toLowerCase() !== "public") {
                    throw new CryptoKeyError(CryptoKeyError.WRONG_FORMAT, type, "raw");
                }
                break;
            case "pkcs8":
                if (type && type.toLowerCase() !== "private") {
                    throw new CryptoKeyError(CryptoKeyError.WRONG_FORMAT, type, "pkcs8");
                }
                break;
            case "spki":
                if (type && type.toLowerCase() !== "public") {
                    throw new CryptoKeyError(CryptoKeyError.WRONG_FORMAT, type, "spki");
                }
                break;
            case "jwk":
                break;
            default:
                throw new CryptoKeyError(CryptoKeyError.UNKNOWN_FORMAT, format);
        }
    };
    BaseCrypto.generateKey = function (algorithm, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.digest = function (algorithm, data) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.sign = function (algorithm, key, data) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.verify = function (algorithm, key, signature, data) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.encrypt = function (algorithm, key, data) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.decrypt = function (algorithm, key, data) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.deriveBits = function (algorithm, baseKey, length) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.deriveKey = function (algorithm, baseKey, derivedKeyType, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.exportKey = function (format, key) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.wrapKey = function (format, key, wrappingKey, wrapAlgorithm) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    BaseCrypto.unwrapKey = function (format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            throw new WebCryptoError(WebCryptoError.NOT_SUPPORTED);
        });
    };
    return BaseCrypto;
}());

var AlgorithmNames = {
    RsaSSA: "RSASSA-PKCS1-v1_5",
    RsaPSS: "RSA-PSS",
    RsaOAEP: "RSA-OAEP",
    AesECB: "AES-ECB",
    AesCTR: "AES-CTR",
    AesCMAC: "AES-CMAC",
    AesGCM: "AES-GCM",
    AesCBC: "AES-CBC",
    AesKW: "AES-KW",
    Sha1: "SHA-1",
    Sha256: "SHA-256",
    Sha384: "SHA-384",
    Sha512: "SHA-512",
    EcDSA: "ECDSA",
    EcDH: "ECDH",
    Hmac: "HMAC",
    Pbkdf2: "PBKDF2",
    Hkdf: "HKDF"
};

if (typeof self === "undefined") {
    var g = global;
    g.btoa = function (data) { return new Buffer(data, "binary").toString("base64"); };
    g.atob = function (data) { return new Buffer(data, "base64").toString("binary"); };
}
var Base64Url = (function () {
    function Base64Url() {
    }
    Base64Url.encode = function (value) {
        var str = this.buffer2string(value);
        var res = btoa(str)
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        return res;
    };
    Base64Url.decode = function (base64url) {
        while (base64url.length % 4) {
            base64url += "=";
        }
        var base64 = base64url
            .replace(/\-/g, "+")
            .replace(/_/g, "/");
        return this.string2buffer(atob(base64));
    };
    Base64Url.buffer2string = function (buffer) {
        var res = "";
        var len = buffer.length;
        for (var i = 0; i < len; i++) {
            res += String.fromCharCode(buffer[i]);
        }
        return res;
    };
    Base64Url.string2buffer = function (binaryString) {
        var res = new Uint8Array(binaryString.length);
        var len = binaryString.length;
        for (var i = 0; i < len; i++) {
            res[i] = binaryString.charCodeAt(i);
        }
        return res;
    };
    return Base64Url;
}());

var AesKeyGenParamsError = (function (_super) {
    tslib_1.__extends(AesKeyGenParamsError, _super);
    function AesKeyGenParamsError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 7;
        return _this;
    }
    return AesKeyGenParamsError;
}(AlgorithmError));
var Aes = (function (_super) {
    tslib_1.__extends(Aes, _super);
    function Aes() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Aes.checkKeyUsages = function (keyUsages) {
        var _this = this;
        _super.checkKeyUsages.call(this, keyUsages);
        var wrongUsage = keyUsages.filter(function (usage) { return _this.KEY_USAGES.indexOf(usage) === -1; });
        if (wrongUsage.length) {
            throw new AlgorithmError(AlgorithmError.WRONG_USAGE, wrongUsage.join(", "));
        }
    };
    Aes.checkAlgorithm = function (alg) {
        if (alg.name.toUpperCase() !== this.ALG_NAME.toUpperCase()) {
            throw new AlgorithmError(AlgorithmError.WRONG_ALG_NAME, alg.name, this.ALG_NAME);
        }
    };
    Aes.checkKeyGenParams = function (alg) {
        switch (alg.length) {
            case 128:
            case 192:
            case 256:
                break;
            default:
                throw new AesKeyGenParamsError(AesKeyGenParamsError.PARAM_WRONG_VALUE, "length", "128, 192 or 256");
        }
    };
    Aes.generateKey = function (algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithm(algorithm);
            _this.checkKeyGenParams(algorithm);
            _this.checkKeyUsages(keyUsages);
            resolve(undefined);
        });
    };
    Aes.exportKey = function (format, key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkKey(key, _this.ALG_NAME);
            _this.checkFormat(format, key.type);
            resolve(undefined);
        });
    };
    Aes.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithm(algorithm);
            _this.checkFormat(format);
            if (!(format.toLowerCase() === "raw" || format.toLowerCase() === "jwk")) {
                throw new CryptoKeyError(CryptoKeyError.ALLOWED_FORMAT, format, "'jwk' or 'raw'");
            }
            _this.checkKeyUsages(keyUsages);
            resolve(undefined);
        });
    };
    Aes.ALG_NAME = "";
    Aes.KEY_USAGES = [];
    return Aes;
}(BaseCrypto));
var AesAlgorithmError = (function (_super) {
    tslib_1.__extends(AesAlgorithmError, _super);
    function AesAlgorithmError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 8;
        return _this;
    }
    return AesAlgorithmError;
}(AlgorithmError));
var AesWrapKey = (function (_super) {
    tslib_1.__extends(AesWrapKey, _super);
    function AesWrapKey() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AesWrapKey.wrapKey = function (format, key, wrappingKey, wrapAlgorithm) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(wrapAlgorithm);
            _this.checkKey(wrappingKey, _this.ALG_NAME, "secret", "wrapKey");
            _this.checkWrappedKey(key);
            _this.checkFormat(format, key.type);
            resolve(undefined);
        });
    };
    AesWrapKey.unwrapKey = function (format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(unwrapAlgorithm);
            _this.checkKey(unwrappingKey, _this.ALG_NAME, "secret", "unwrapKey");
            _this.checkFormat(format);
            resolve(undefined);
        });
    };
    return AesWrapKey;
}(Aes));
var AesEncrypt = (function (_super) {
    tslib_1.__extends(AesEncrypt, _super);
    function AesEncrypt() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AesEncrypt.encrypt = function (algorithm, key, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "secret", "encrypt");
            resolve(undefined);
        });
    };
    AesEncrypt.decrypt = function (algorithm, key, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "secret", "decrypt");
            resolve(undefined);
        });
    };
    AesEncrypt.KEY_USAGES = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
    return AesEncrypt;
}(AesWrapKey));
var AesECB = (function (_super) {
    tslib_1.__extends(AesECB, _super);
    function AesECB() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AesECB.ALG_NAME = AlgorithmNames.AesECB;
    return AesECB;
}(AesEncrypt));
var AesCBC = (function (_super) {
    tslib_1.__extends(AesCBC, _super);
    function AesCBC() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AesCBC.checkAlgorithmParams = function (alg) {
        this.checkAlgorithm(alg);
        if (!alg.iv) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_REQUIRED, "iv");
        }
        if (!(ArrayBuffer.isView(alg.iv) || alg.iv instanceof ArrayBuffer)) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_TYPE, "iv", "ArrayBufferView or ArrayBuffer");
        }
        if (alg.iv.byteLength !== 16) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_VALUE, "iv", "ArrayBufferView or ArrayBuffer with size 16");
        }
    };
    AesCBC.ALG_NAME = AlgorithmNames.AesCBC;
    return AesCBC;
}(AesEncrypt));
var AesCTR = (function (_super) {
    tslib_1.__extends(AesCTR, _super);
    function AesCTR() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AesCTR.checkAlgorithmParams = function (alg) {
        this.checkAlgorithm(alg);
        if (!(alg.counter && (ArrayBuffer.isView(alg.counter) || alg.counter instanceof ArrayBuffer))) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_TYPE, "counter", "ArrayBufferView or ArrayBuffer");
        }
        if (alg.counter.byteLength !== 16) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_VALUE, "counter", "ArrayBufferView or ArrayBuffer with size 16");
        }
        if (!(alg.length > 0 && alg.length <= 128)) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_VALUE, "length", "number [1-128]");
        }
    };
    AesCTR.ALG_NAME = AlgorithmNames.AesCTR;
    return AesCTR;
}(AesEncrypt));
var AesGCM = (function (_super) {
    tslib_1.__extends(AesGCM, _super);
    function AesGCM() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AesGCM.checkAlgorithmParams = function (alg) {
        this.checkAlgorithm(alg);
        if (alg.additionalData) {
            if (!(ArrayBuffer.isView(alg.additionalData) || alg.additionalData instanceof ArrayBuffer)) {
                throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_TYPE, "additionalData", "ArrayBufferView or ArrayBuffer");
            }
        }
        if (!alg.iv) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_REQUIRED, "iv");
        }
        if (!(ArrayBuffer.isView(alg.iv) || alg.iv instanceof ArrayBuffer)) {
            throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_TYPE, "iv", "ArrayBufferView or ArrayBuffer");
        }
        if (alg.tagLength) {
            var ok = [32, 64, 96, 104, 112, 120, 128].some(function (tagLength) {
                return tagLength === alg.tagLength;
            });
            if (!ok) {
                throw new AesAlgorithmError(AesAlgorithmError.PARAM_WRONG_VALUE, "tagLength", "32, 64, 96, 104, 112, 120 or 128");
            }
        }
    };
    AesGCM.ALG_NAME = AlgorithmNames.AesGCM;
    return AesGCM;
}(AesEncrypt));
var AesKW = (function (_super) {
    tslib_1.__extends(AesKW, _super);
    function AesKW() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AesKW.checkAlgorithmParams = function (alg) {
        this.checkAlgorithm(alg);
    };
    AesKW.ALG_NAME = AlgorithmNames.AesKW;
    AesKW.KEY_USAGES = ["wrapKey", "unwrapKey"];
    return AesKW;
}(AesWrapKey));

var ShaAlgorithms = [AlgorithmNames.Sha1, AlgorithmNames.Sha256, AlgorithmNames.Sha384, AlgorithmNames.Sha512].join(" | ");
var Sha = (function (_super) {
    tslib_1.__extends(Sha, _super);
    function Sha() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Sha.checkAlgorithm = function (alg) {
        var alg2;
        if (typeof alg === "string") {
            alg2 = { name: alg };
        }
        else {
            alg2 = alg;
        }
        _super.checkAlgorithm.call(this, alg2);
        switch (alg2.name.toUpperCase()) {
            case AlgorithmNames.Sha1:
            case AlgorithmNames.Sha256:
            case AlgorithmNames.Sha384:
            case AlgorithmNames.Sha512:
                break;
            default:
                throw new AlgorithmError(AlgorithmError.WRONG_ALG_NAME, alg2.name, ShaAlgorithms);
        }
    };
    Sha.digest = function (algorithm, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithm(algorithm);
            resolve(undefined);
        });
    };
    return Sha;
}(BaseCrypto));

var EcKeyGenParamsError = (function (_super) {
    tslib_1.__extends(EcKeyGenParamsError, _super);
    function EcKeyGenParamsError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 9;
        return _this;
    }
    return EcKeyGenParamsError;
}(AlgorithmError));
var Ec = (function (_super) {
    tslib_1.__extends(Ec, _super);
    function Ec() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Ec.checkAlgorithm = function (alg) {
        if (alg.name.toUpperCase() !== this.ALG_NAME.toUpperCase()) {
            throw new AlgorithmError(AlgorithmError.WRONG_ALG_NAME, alg.name, this.ALG_NAME);
        }
    };
    Ec.checkKeyGenParams = function (alg) {
        var paramNamedCurve = "namedCurve";
        if (!alg.namedCurve) {
            throw new EcKeyGenParamsError(EcKeyGenParamsError.PARAM_REQUIRED, paramNamedCurve);
        }
        if (!(typeof alg.namedCurve === "string")) {
            throw new EcKeyGenParamsError(EcKeyGenParamsError.PARAM_WRONG_TYPE, paramNamedCurve, "string");
        }
        switch (alg.namedCurve.toUpperCase()) {
            case "P-256":
            case "K-256":
            case "P-384":
            case "P-521":
                break;
            default:
                throw new EcKeyGenParamsError(EcKeyGenParamsError.PARAM_WRONG_VALUE, paramNamedCurve, "K-256, P-256, P-384 or P-521");
        }
    };
    Ec.checkKeyGenUsages = function (keyUsages) {
        var _this = this;
        keyUsages.forEach(function (usage) {
            var i = 0;
            for (i; i < _this.KEY_USAGES.length; i++) {
                if (_this.KEY_USAGES[i].toLowerCase() === usage.toLowerCase()) {
                    break;
                }
            }
            if (i === _this.KEY_USAGES.length) {
                throw new WebCryptoError("Unsupported key usage '" + usage + "'. Should be one of [" + _this.KEY_USAGES.join(", ") + "]");
            }
        });
    };
    Ec.generateKey = function (algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithm(algorithm);
            _this.checkKeyGenParams(algorithm);
            _this.checkKeyGenUsages(keyUsages);
            resolve(undefined);
        });
    };
    Ec.exportKey = function (format, key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkKey(key, _this.ALG_NAME);
            if (!(format && format.toLowerCase() === "raw" && key.type === "public")) {
                _this.checkFormat(format, key.type);
            }
            resolve(undefined);
        });
    };
    Ec.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkKeyGenParams(algorithm);
            _this.checkFormat(format);
            _this.checkKeyGenUsages(keyUsages);
            resolve(undefined);
        });
    };
    Ec.ALG_NAME = "";
    Ec.KEY_USAGES = [];
    return Ec;
}(BaseCrypto));
var EcAlgorithmError = (function (_super) {
    tslib_1.__extends(EcAlgorithmError, _super);
    function EcAlgorithmError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 10;
        return _this;
    }
    return EcAlgorithmError;
}(AlgorithmError));
var EcDSA = (function (_super) {
    tslib_1.__extends(EcDSA, _super);
    function EcDSA() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EcDSA.checkAlgorithmParams = function (alg) {
        this.checkAlgorithm(alg);
        Sha.checkAlgorithm(alg.hash);
    };
    EcDSA.sign = function (algorithm, key, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "private", "sign");
            resolve(undefined);
        });
    };
    EcDSA.verify = function (algorithm, key, signature, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "public", "verify");
            resolve(undefined);
        });
    };
    EcDSA.ALG_NAME = AlgorithmNames.EcDSA;
    EcDSA.KEY_USAGES = ["sign", "verify", "deriveKey", "deriveBits"];
    return EcDSA;
}(Ec));
var EcDH = (function (_super) {
    tslib_1.__extends(EcDH, _super);
    function EcDH() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EcDH.checkDeriveParams = function (algorithm) {
        var paramPublic = "public";
        this.checkAlgorithm(algorithm);
        if (!algorithm.public) {
            throw new EcAlgorithmError(EcAlgorithmError.PARAM_REQUIRED, paramPublic);
        }
        this.checkKey(algorithm.public, this.ALG_NAME, "public");
    };
    EcDH.deriveBits = function (algorithm, baseKey, length) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkDeriveParams(algorithm);
            _this.checkKey(baseKey, _this.ALG_NAME, "private", "deriveBits");
            resolve(undefined);
        });
    };
    EcDH.deriveKey = function (algorithm, baseKey, derivedKeyType, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkDeriveParams(algorithm);
            _this.checkKey(baseKey, _this.ALG_NAME, "private", "deriveKey");
            BaseCrypto.checkAlgorithm(derivedKeyType);
            switch (derivedKeyType.name.toUpperCase()) {
                case AlgorithmNames.AesCBC:
                    AesCBC.checkKeyGenParams(derivedKeyType);
                    break;
                case AlgorithmNames.AesCTR:
                    AesCTR.checkKeyGenParams(derivedKeyType);
                    break;
                case AlgorithmNames.AesGCM:
                    AesGCM.checkKeyGenParams(derivedKeyType);
                    break;
                case AlgorithmNames.AesKW:
                    AesKW.checkKeyGenParams(derivedKeyType);
                    break;
                default:
                    throw new EcAlgorithmError("Unsupported name '" + derivedKeyType.name + "' for algorithm in param 'derivedKeyType'");
            }
            resolve(undefined);
        });
    };
    EcDH.ALG_NAME = AlgorithmNames.EcDH;
    EcDH.KEY_USAGES = ["deriveKey", "deriveBits"];
    return EcDH;
}(Ec));

var Hmac = (function (_super) {
    tslib_1.__extends(Hmac, _super);
    function Hmac() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hmac.checkAlgorithm = function (alg) {
        if (alg.name.toUpperCase() !== this.ALG_NAME.toUpperCase()) {
            throw new AlgorithmError(AlgorithmError.WRONG_ALG_NAME, alg.name, this.ALG_NAME);
        }
    };
    Hmac.checkKeyGenParams = function (alg) {
        if ("length" in alg && !(alg.length > 0 && alg.length <= 512)) {
            throw new AlgorithmError(AlgorithmError.PARAM_WRONG_VALUE, "length", "more 0 and less than 512");
        }
    };
    Hmac.checkKeyGenUsages = function (keyUsages) {
        var _this = this;
        this.checkKeyUsages(keyUsages);
        keyUsages.forEach(function (usage) {
            var i = 0;
            for (i; i < _this.KEY_USAGES.length; i++) {
                if (_this.KEY_USAGES[i].toLowerCase() === usage.toLowerCase()) {
                    break;
                }
            }
            if (i === _this.KEY_USAGES.length) {
                throw new WebCryptoError("Unsupported key usage '" + usage + "'. Should be one of [" + _this.KEY_USAGES.join(", ") + "]");
            }
        });
    };
    Hmac.generateKey = function (algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithm(algorithm);
            _this.checkKeyGenParams(algorithm);
            _this.checkKeyGenUsages(keyUsages);
            resolve(undefined);
        });
    };
    Hmac.exportKey = function (format, key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkKey(key, _this.ALG_NAME);
            _this.checkFormat(format, key.type);
            resolve(undefined);
        });
    };
    Hmac.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithm(algorithm);
            _this.checkFormat(format);
            if (!(format.toLowerCase() === "raw" || format.toLowerCase() === "jwk")) {
                throw new CryptoKeyError(CryptoKeyError.ALLOWED_FORMAT, format, "'jwk' or 'raw'");
            }
            _this.checkKeyGenUsages(keyUsages);
            resolve(undefined);
        });
    };
    Hmac.sign = function (algorithm, key, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "secret", "sign");
            resolve(undefined);
        });
    };
    Hmac.verify = function (algorithm, key, signature, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "secret", "verify");
            resolve(undefined);
        });
    };
    Hmac.ALG_NAME = AlgorithmNames.Hmac;
    Hmac.KEY_USAGES = ["sign", "verify"];
    return Hmac;
}(BaseCrypto));

var Hkdf = (function (_super) {
    tslib_1.__extends(Hkdf, _super);
    function Hkdf() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hkdf.checkAlgorithm = function (alg) {
        if (alg.name.toUpperCase() !== this.ALG_NAME.toUpperCase()) {
            throw new AlgorithmError(AlgorithmError.WRONG_ALG_NAME, alg.name, this.ALG_NAME);
        }
    };
    Hkdf.checkDeriveParams = function (alg) {
        this.checkAlgorithm(alg);
        if (alg.salt) {
            if (!(ArrayBuffer.isView(alg.salt) || alg.salt instanceof ArrayBuffer)) {
                throw new AlgorithmError(AlgorithmError.PARAM_WRONG_TYPE, "salt", "ArrayBuffer or ArrayBufferView");
            }
        }
        else {
            throw new AlgorithmError(AlgorithmError.PARAM_REQUIRED, "salt");
        }
        if (alg.info) {
            if (!(ArrayBuffer.isView(alg.info) || alg.info instanceof ArrayBuffer)) {
                throw new AlgorithmError(AlgorithmError.PARAM_WRONG_TYPE, "info", "ArrayBuffer or ArrayBufferView");
            }
        }
        else {
            throw new AlgorithmError(AlgorithmError.PARAM_REQUIRED, "info");
        }
        if (!alg.hash) {
            throw new AlgorithmError(AlgorithmError.PARAM_REQUIRED, "hash");
        }
        var hash = PrepareAlgorithm(alg.hash);
        Sha.checkAlgorithm(hash);
    };
    Hkdf.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (extractable) {
                throw new WebCryptoError("KDF keys must set extractable=false");
            }
            _this.checkAlgorithm(algorithm);
            _this.checkFormat(format);
            if (format.toLowerCase() !== "raw") {
                throw new CryptoKeyError(CryptoKeyError.ALLOWED_FORMAT, format, "'raw'");
            }
            _this.checkKeyUsages(keyUsages);
        });
    };
    Hkdf.deriveKey = function (algorithm, baseKey, derivedKeyType, extractable, keyUsages) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this.checkDeriveParams(algorithm);
            _this.checkKey(baseKey, _this.ALG_NAME, "secret", "deriveKey");
            BaseCrypto.checkAlgorithm(derivedKeyType);
            switch (derivedKeyType.name.toUpperCase()) {
                case AlgorithmNames.AesCBC:
                    AesCBC.checkKeyGenParams(derivedKeyType);
                    AesCBC.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.AesCTR:
                    AesCTR.checkKeyGenParams(derivedKeyType);
                    AesCTR.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.AesGCM:
                    AesGCM.checkKeyGenParams(derivedKeyType);
                    AesGCM.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.AesKW:
                    AesKW.checkKeyGenParams(derivedKeyType);
                    AesKW.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.Hmac:
                    Hmac.checkKeyGenParams(derivedKeyType);
                    Hmac.checkKeyUsages(keyUsages);
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, derivedKeyType);
            }
        });
    };
    Hkdf.deriveBits = function (algorithm, baseKey, length) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this.checkDeriveParams(algorithm);
            _this.checkKey(baseKey, _this.ALG_NAME, "secret", "deriveBits");
            if (!(length && typeof length === "number")) {
                throw new WebCryptoError("Parameter 'length' must be Number and more than 0");
            }
        });
    };
    Hkdf.ALG_NAME = AlgorithmNames.Hkdf;
    Hkdf.KEY_USAGES = ["deriveKey", "deriveBits"];
    return Hkdf;
}(BaseCrypto));

var Pbkdf2 = (function (_super) {
    tslib_1.__extends(Pbkdf2, _super);
    function Pbkdf2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Pbkdf2.checkAlgorithm = function (alg) {
        if (alg.name.toUpperCase() !== this.ALG_NAME.toUpperCase()) {
            throw new AlgorithmError(AlgorithmError.WRONG_ALG_NAME, alg.name, this.ALG_NAME);
        }
    };
    Pbkdf2.checkDeriveParams = function (alg) {
        this.checkAlgorithm(alg);
        if (alg.salt) {
            if (!(ArrayBuffer.isView(alg.salt) || alg.salt instanceof ArrayBuffer)) {
                throw new AlgorithmError(AlgorithmError.PARAM_WRONG_TYPE, "salt", "ArrayBuffer or ArrayBufferView");
            }
        }
        else {
            throw new AlgorithmError(AlgorithmError.PARAM_REQUIRED, "salt");
        }
        if (!alg.iterations) {
            throw new AlgorithmError(AlgorithmError.PARAM_REQUIRED, "iterations");
        }
        if (!alg.hash) {
            throw new AlgorithmError(AlgorithmError.PARAM_REQUIRED, "hash");
        }
        var hash = PrepareAlgorithm(alg.hash);
        Sha.checkAlgorithm(hash);
    };
    Pbkdf2.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            if (extractable) {
                throw new WebCryptoError("KDF keys must set extractable=false");
            }
            _this.checkAlgorithm(algorithm);
            _this.checkFormat(format);
            if (format.toLowerCase() !== "raw") {
                throw new CryptoKeyError(CryptoKeyError.ALLOWED_FORMAT, format, "'raw'");
            }
            _this.checkKeyUsages(keyUsages);
        });
    };
    Pbkdf2.deriveKey = function (algorithm, baseKey, derivedKeyType, extractable, keyUsages) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this.checkDeriveParams(algorithm);
            _this.checkKey(baseKey, _this.ALG_NAME, "secret", "deriveKey");
            BaseCrypto.checkAlgorithm(derivedKeyType);
            switch (derivedKeyType.name.toUpperCase()) {
                case AlgorithmNames.AesCBC:
                    AesCBC.checkKeyGenParams(derivedKeyType);
                    AesCBC.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.AesCTR:
                    AesCTR.checkKeyGenParams(derivedKeyType);
                    AesCTR.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.AesGCM:
                    AesGCM.checkKeyGenParams(derivedKeyType);
                    AesGCM.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.AesKW:
                    AesKW.checkKeyGenParams(derivedKeyType);
                    AesKW.checkKeyUsages(keyUsages);
                    break;
                case AlgorithmNames.Hmac:
                    Hmac.checkKeyGenParams(derivedKeyType);
                    Hmac.checkKeyUsages(keyUsages);
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, derivedKeyType);
            }
        });
    };
    Pbkdf2.deriveBits = function (algorithm, baseKey, length) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            _this.checkDeriveParams(algorithm);
            _this.checkKey(baseKey, _this.ALG_NAME, "secret", "deriveBits");
            if (!(length && typeof length === "number")) {
                throw new WebCryptoError("Parameter 'length' must be Number and more than 0");
            }
        });
    };
    Pbkdf2.ALG_NAME = AlgorithmNames.Pbkdf2;
    Pbkdf2.KEY_USAGES = ["deriveKey", "deriveBits"];
    return Pbkdf2;
}(BaseCrypto));

var RsaKeyGenParamsError = (function (_super) {
    tslib_1.__extends(RsaKeyGenParamsError, _super);
    function RsaKeyGenParamsError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 2;
        return _this;
    }
    return RsaKeyGenParamsError;
}(AlgorithmError));
var RsaHashedImportParamsError = (function (_super) {
    tslib_1.__extends(RsaHashedImportParamsError, _super);
    function RsaHashedImportParamsError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 6;
        return _this;
    }
    return RsaHashedImportParamsError;
}(AlgorithmError));
var Rsa = (function (_super) {
    tslib_1.__extends(Rsa, _super);
    function Rsa() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rsa.checkAlgorithm = function (alg) {
        if (alg.name.toUpperCase() !== this.ALG_NAME.toUpperCase()) {
            throw new AlgorithmError(AlgorithmError.WRONG_ALG_NAME, alg.name, this.ALG_NAME);
        }
    };
    Rsa.checkImportAlgorithm = function (alg) {
        this.checkAlgorithm(alg);
        if (!alg.hash) {
            throw new RsaHashedImportParamsError(RsaHashedImportParamsError.PARAM_REQUIRED, "hash");
        }
        Sha.checkAlgorithm(alg.hash);
    };
    Rsa.checkKeyGenParams = function (alg) {
        var modulusBits = alg.modulusLength;
        if (!(modulusBits >= 256 && modulusBits <= 16384 && !(modulusBits % 8))) {
            throw new RsaKeyGenParamsError(RsaKeyGenParamsError.PARAM_WRONG_VALUE, "modulusLength", " a multiple of 8 bits and >= 256 and <= 16384");
        }
        var pubExp = alg.publicExponent;
        if (!pubExp) {
            throw new RsaKeyGenParamsError(RsaKeyGenParamsError.PARAM_REQUIRED, "publicExponent");
        }
        if (!ArrayBuffer.isView(pubExp)) {
            throw new RsaKeyGenParamsError(RsaKeyGenParamsError.PARAM_WRONG_TYPE, "publicExponent", "ArrayBufferView");
        }
        if (!(pubExp[0] === 3 || (pubExp[0] === 1 && pubExp[1] === 0 && pubExp[2] === 1))) {
            throw new RsaKeyGenParamsError(RsaKeyGenParamsError.PARAM_WRONG_VALUE, "publicExponent", "Uint8Array([3]) | Uint8Array([1, 0, 1])");
        }
        if (!alg.hash) {
            throw new RsaKeyGenParamsError(RsaKeyGenParamsError.PARAM_REQUIRED, "hash", ShaAlgorithms);
        }
        Sha.checkAlgorithm(alg.hash);
    };
    Rsa.checkKeyGenUsages = function (keyUsages) {
        var _this = this;
        this.checkKeyUsages(keyUsages);
        keyUsages.forEach(function (usage) {
            var i = 0;
            for (i; i < _this.KEY_USAGES.length; i++) {
                if (_this.KEY_USAGES[i].toLowerCase() === usage.toLowerCase()) {
                    break;
                }
            }
            if (i === _this.KEY_USAGES.length) {
                throw new WebCryptoError("Unsupported key usage '" + usage + "'. Should be one of [" + _this.KEY_USAGES.join(", ") + "]");
            }
        });
    };
    Rsa.generateKey = function (algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithm(algorithm);
            _this.checkKeyGenParams(algorithm);
            _this.checkKeyGenUsages(keyUsages);
            resolve(undefined);
        });
    };
    Rsa.exportKey = function (format, key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkKey(key, _this.ALG_NAME);
            _this.checkFormat(format, key.type);
            resolve(undefined);
        });
    };
    Rsa.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkImportAlgorithm(algorithm);
            _this.checkFormat(format);
            if (format.toLowerCase() === "raw") {
                throw new CryptoKeyError(CryptoKeyError.ALLOWED_FORMAT, format, "'JsonWebKey', 'pkcs8' or 'spki'");
            }
            _this.checkKeyGenUsages(keyUsages);
            resolve(undefined);
        });
    };
    Rsa.ALG_NAME = "";
    Rsa.KEY_USAGES = [];
    return Rsa;
}(BaseCrypto));
var RsaSSA = (function (_super) {
    tslib_1.__extends(RsaSSA, _super);
    function RsaSSA() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RsaSSA.sign = function (algorithm, key, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "private", "sign");
            resolve(undefined);
        });
    };
    RsaSSA.verify = function (algorithm, key, signature, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "public", "verify");
            resolve(undefined);
        });
    };
    RsaSSA.ALG_NAME = AlgorithmNames.RsaSSA;
    RsaSSA.KEY_USAGES = ["sign", "verify"];
    return RsaSSA;
}(Rsa));
var RsaPSSParamsError = (function (_super) {
    tslib_1.__extends(RsaPSSParamsError, _super);
    function RsaPSSParamsError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 4;
        return _this;
    }
    return RsaPSSParamsError;
}(AlgorithmError));
var RsaPSS = (function (_super) {
    tslib_1.__extends(RsaPSS, _super);
    function RsaPSS() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RsaPSS.checkAlgorithmParams = function (algorithm) {
        var alg = algorithm;
        _super.checkAlgorithmParams.call(this, alg);
        if (!alg.saltLength) {
            throw new RsaPSSParamsError(RsaPSSParamsError.PARAM_REQUIRED, "saltLength");
        }
        if (alg.saltLength < 0) {
            throw new RsaPSSParamsError("Parameter 'saltLength' is outside of numeric range");
        }
    };
    RsaPSS.ALG_NAME = AlgorithmNames.RsaPSS;
    return RsaPSS;
}(RsaSSA));
var RsaOAEPParamsError = (function (_super) {
    tslib_1.__extends(RsaOAEPParamsError, _super);
    function RsaOAEPParamsError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.code = 5;
        return _this;
    }
    return RsaOAEPParamsError;
}(AlgorithmError));
var RsaOAEP = (function (_super) {
    tslib_1.__extends(RsaOAEP, _super);
    function RsaOAEP() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RsaOAEP.checkAlgorithmParams = function (alg) {
        if (alg.label) {
            if (!(ArrayBuffer.isView(alg.label) || alg.label instanceof ArrayBuffer)) {
                throw new RsaOAEPParamsError(RsaOAEPParamsError.PARAM_WRONG_TYPE, "label", "ArrayBufferView or ArrayBuffer");
            }
        }
    };
    RsaOAEP.encrypt = function (algorithm, key, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "public", "encrypt");
            resolve(undefined);
        });
    };
    RsaOAEP.decrypt = function (algorithm, key, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(algorithm);
            _this.checkKey(key, _this.ALG_NAME, "private", "decrypt");
            resolve(undefined);
        });
    };
    RsaOAEP.wrapKey = function (format, key, wrappingKey, wrapAlgorithm) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(wrapAlgorithm);
            _this.checkKey(wrappingKey, _this.ALG_NAME, "public", "wrapKey");
            _this.checkWrappedKey(key);
            _this.checkFormat(format, key.type);
            resolve(undefined);
        });
    };
    RsaOAEP.unwrapKey = function (format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.checkAlgorithmParams(unwrapAlgorithm);
            _this.checkKey(unwrappingKey, _this.ALG_NAME, "private", "unwrapKey");
            _this.checkFormat(format);
            resolve(undefined);
        });
    };
    RsaOAEP.ALG_NAME = AlgorithmNames.RsaOAEP;
    RsaOAEP.KEY_USAGES = ["encrypt", "decrypt", "wrapKey", "unwrapKey"];
    return RsaOAEP;
}(Rsa));

var SubtleCrypto = (function () {
    function SubtleCrypto() {
    }
    SubtleCrypto.prototype.generateKey = function (algorithm, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.RsaSSA.toUpperCase():
                    Class = RsaSSA;
                    break;
                case AlgorithmNames.RsaOAEP.toUpperCase():
                    Class = RsaOAEP;
                    break;
                case AlgorithmNames.RsaPSS.toUpperCase():
                    Class = RsaPSS;
                    break;
                case AlgorithmNames.AesECB.toUpperCase():
                    Class = AesECB;
                    break;
                case AlgorithmNames.AesCBC.toUpperCase():
                    Class = AesCBC;
                    break;
                case AlgorithmNames.AesCTR.toUpperCase():
                    Class = AesCTR;
                    break;
                case AlgorithmNames.AesGCM.toUpperCase():
                    Class = AesGCM;
                    break;
                case AlgorithmNames.AesKW.toUpperCase():
                    Class = AesKW;
                    break;
                case AlgorithmNames.EcDSA.toUpperCase():
                    Class = EcDSA;
                    break;
                case AlgorithmNames.EcDH.toUpperCase():
                    Class = EcDH;
                    break;
                case AlgorithmNames.Hmac.toUpperCase():
                    Class = Hmac;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.generateKey(alg, extractable, keyUsages).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.digest = function (algorithm, data) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var buf = PrepareData(data, "data");
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.Sha1.toUpperCase():
                case AlgorithmNames.Sha256.toUpperCase():
                case AlgorithmNames.Sha384.toUpperCase():
                case AlgorithmNames.Sha512.toUpperCase():
                    Class = Sha;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.digest(alg, buf).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.sign = function (algorithm, key, data) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var buf = PrepareData(data, "data");
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.RsaSSA.toUpperCase():
                    Class = RsaSSA;
                    break;
                case AlgorithmNames.RsaPSS.toUpperCase():
                    Class = RsaPSS;
                    break;
                case AlgorithmNames.EcDSA.toUpperCase():
                    Class = EcDSA;
                    break;
                case AlgorithmNames.Hmac.toUpperCase():
                    Class = Hmac;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.sign(alg, key, buf).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.verify = function (algorithm, key, signature, data) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var sigBuf = PrepareData(data, "signature");
            var buf = PrepareData(data, "data");
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.RsaSSA.toUpperCase():
                    Class = RsaSSA;
                    break;
                case AlgorithmNames.RsaPSS.toUpperCase():
                    Class = RsaPSS;
                    break;
                case AlgorithmNames.EcDSA.toUpperCase():
                    Class = EcDSA;
                    break;
                case AlgorithmNames.Hmac.toUpperCase():
                    Class = Hmac;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.verify(alg, key, sigBuf, buf).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.encrypt = function (algorithm, key, data) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var buf = PrepareData(data, "data");
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.RsaOAEP.toUpperCase():
                    Class = RsaOAEP;
                    break;
                case AlgorithmNames.AesECB.toUpperCase():
                    Class = AesECB;
                    break;
                case AlgorithmNames.AesCBC.toUpperCase():
                    Class = AesCBC;
                    break;
                case AlgorithmNames.AesCTR.toUpperCase():
                    Class = AesCTR;
                    break;
                case AlgorithmNames.AesGCM.toUpperCase():
                    Class = AesGCM;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.encrypt(alg, key, buf).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.decrypt = function (algorithm, key, data) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var buf = PrepareData(data, "data");
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.RsaOAEP.toUpperCase():
                    Class = RsaOAEP;
                    break;
                case AlgorithmNames.AesECB.toUpperCase():
                    Class = AesECB;
                    break;
                case AlgorithmNames.AesCBC.toUpperCase():
                    Class = AesCBC;
                    break;
                case AlgorithmNames.AesCTR.toUpperCase():
                    Class = AesCTR;
                    break;
                case AlgorithmNames.AesGCM.toUpperCase():
                    Class = AesGCM;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.decrypt(alg, key, buf).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.deriveBits = function (algorithm, baseKey, length) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.EcDH.toUpperCase():
                    Class = EcDH;
                    break;
                case AlgorithmNames.Pbkdf2.toUpperCase():
                    Class = Pbkdf2;
                    break;
                case AlgorithmNames.Hkdf.toUpperCase():
                    Class = Hkdf;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.deriveBits(alg, baseKey, length).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.deriveKey = function (algorithm, baseKey, derivedKeyType, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var derivedAlg = PrepareAlgorithm(derivedKeyType);
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.EcDH.toUpperCase():
                    Class = EcDH;
                    break;
                case AlgorithmNames.Pbkdf2.toUpperCase():
                    Class = Pbkdf2;
                    break;
                case AlgorithmNames.Hkdf.toUpperCase():
                    Class = Hkdf;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.deriveKey(alg, baseKey, derivedAlg, extractable, keyUsages).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.exportKey = function (format, key) {
        return new Promise(function (resolve, reject) {
            BaseCrypto.checkKey(key);
            if (!key.extractable) {
                throw new CryptoKeyError(CryptoKeyError.NOT_EXTRACTABLE);
            }
            var Class = BaseCrypto;
            switch (key.algorithm.name.toUpperCase()) {
                case AlgorithmNames.RsaSSA.toUpperCase():
                    Class = RsaSSA;
                    break;
                case AlgorithmNames.RsaPSS.toUpperCase():
                    Class = RsaPSS;
                    break;
                case AlgorithmNames.AesECB.toUpperCase():
                    Class = AesECB;
                    break;
                case AlgorithmNames.RsaOAEP.toUpperCase():
                    Class = RsaOAEP;
                    break;
                case AlgorithmNames.AesCBC.toUpperCase():
                    Class = AesCBC;
                    break;
                case AlgorithmNames.AesCTR.toUpperCase():
                    Class = AesCTR;
                    break;
                case AlgorithmNames.AesGCM.toUpperCase():
                    Class = AesGCM;
                    break;
                case AlgorithmNames.AesKW.toUpperCase():
                    Class = AesKW;
                    break;
                case AlgorithmNames.EcDSA.toUpperCase():
                    Class = EcDSA;
                    break;
                case AlgorithmNames.EcDH.toUpperCase():
                    Class = EcDH;
                    break;
                case AlgorithmNames.Hmac.toUpperCase():
                    Class = Hmac;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, key.algorithm.name);
            }
            Class.exportKey(format, key).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.importKey = function (format, keyData, algorithm, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(algorithm);
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.RsaSSA.toUpperCase():
                    Class = RsaSSA;
                    break;
                case AlgorithmNames.RsaPSS.toUpperCase():
                    Class = RsaPSS;
                    break;
                case AlgorithmNames.RsaOAEP.toUpperCase():
                    Class = RsaOAEP;
                    break;
                case AlgorithmNames.AesECB.toUpperCase():
                    Class = AesECB;
                    break;
                case AlgorithmNames.AesCBC.toUpperCase():
                    Class = AesCBC;
                    break;
                case AlgorithmNames.AesCTR.toUpperCase():
                    Class = AesCTR;
                    break;
                case AlgorithmNames.AesGCM.toUpperCase():
                    Class = AesGCM;
                    break;
                case AlgorithmNames.AesKW.toUpperCase():
                    Class = AesKW;
                    break;
                case AlgorithmNames.EcDSA.toUpperCase():
                    Class = EcDSA;
                    break;
                case AlgorithmNames.EcDH.toUpperCase():
                    Class = EcDH;
                    break;
                case AlgorithmNames.Hmac.toUpperCase():
                    Class = Hmac;
                    break;
                case AlgorithmNames.Pbkdf2.toUpperCase():
                    Class = Pbkdf2;
                    break;
                case AlgorithmNames.Hkdf.toUpperCase():
                    Class = Hkdf;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.importKey(format, keyData, alg, extractable, keyUsages).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.wrapKey = function (format, key, wrappingKey, wrapAlgorithm) {
        return new Promise(function (resolve, reject) {
            var alg = PrepareAlgorithm(wrapAlgorithm);
            var Class = BaseCrypto;
            switch (alg.name.toUpperCase()) {
                case AlgorithmNames.RsaOAEP.toUpperCase():
                    Class = RsaOAEP;
                    break;
                case AlgorithmNames.AesECB.toUpperCase():
                    Class = AesECB;
                    break;
                case AlgorithmNames.AesCBC.toUpperCase():
                    Class = AesCBC;
                    break;
                case AlgorithmNames.AesCTR.toUpperCase():
                    Class = AesCTR;
                    break;
                case AlgorithmNames.AesGCM.toUpperCase():
                    Class = AesGCM;
                    break;
                case AlgorithmNames.AesKW.toUpperCase():
                    Class = AesKW;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, alg.name);
            }
            Class.wrapKey(format, key, wrappingKey, alg).then(resolve, reject);
        });
    };
    SubtleCrypto.prototype.unwrapKey = function (format, wrappedKey, unwrappingKey, unwrapAlgorithm, unwrappedKeyAlgorithm, extractable, keyUsages) {
        return new Promise(function (resolve, reject) {
            var unwrapAlg = PrepareAlgorithm(unwrapAlgorithm);
            var unwrappedAlg = PrepareAlgorithm(unwrappedKeyAlgorithm);
            var buf = PrepareData(wrappedKey, "wrappedKey");
            var Class = BaseCrypto;
            switch (unwrapAlg.name.toUpperCase()) {
                case AlgorithmNames.RsaOAEP.toUpperCase():
                    Class = RsaOAEP;
                    break;
                case AlgorithmNames.AesECB.toUpperCase():
                    Class = AesECB;
                    break;
                case AlgorithmNames.AesCBC.toUpperCase():
                    Class = AesCBC;
                    break;
                case AlgorithmNames.AesCTR.toUpperCase():
                    Class = AesCTR;
                    break;
                case AlgorithmNames.AesGCM.toUpperCase():
                    Class = AesGCM;
                    break;
                case AlgorithmNames.AesKW.toUpperCase():
                    Class = AesKW;
                    break;
                default:
                    throw new AlgorithmError(AlgorithmError.UNSUPPORTED_ALGORITHM, unwrapAlg.name);
            }
            Class.unwrapKey(format, buf, unwrappingKey, unwrapAlg, unwrappedAlg, extractable, keyUsages).then(resolve, reject);
        });
    };
    return SubtleCrypto;
}());

exports.WebCryptoError = WebCryptoError;
exports.AlgorithmError = AlgorithmError;
exports.CryptoKeyError = CryptoKeyError;
exports.PrepareAlgorithm = PrepareAlgorithm;
exports.PrepareData = PrepareData;
exports.BaseCrypto = BaseCrypto;
exports.AlgorithmNames = AlgorithmNames;
exports.Base64Url = Base64Url;
exports.SubtleCrypto = SubtleCrypto;
exports.Aes = Aes;
exports.AesAlgorithmError = AesAlgorithmError;
exports.AesWrapKey = AesWrapKey;
exports.AesEncrypt = AesEncrypt;
exports.AesECB = AesECB;
exports.AesCBC = AesCBC;
exports.AesCTR = AesCTR;
exports.AesGCM = AesGCM;
exports.AesKW = AesKW;
exports.RsaKeyGenParamsError = RsaKeyGenParamsError;
exports.RsaHashedImportParamsError = RsaHashedImportParamsError;
exports.Rsa = Rsa;
exports.RsaSSA = RsaSSA;
exports.RsaPSSParamsError = RsaPSSParamsError;
exports.RsaPSS = RsaPSS;
exports.RsaOAEPParamsError = RsaOAEPParamsError;
exports.RsaOAEP = RsaOAEP;
exports.EcKeyGenParamsError = EcKeyGenParamsError;
exports.Ec = Ec;
exports.EcAlgorithmError = EcAlgorithmError;
exports.EcDSA = EcDSA;
exports.EcDH = EcDH;
exports.ShaAlgorithms = ShaAlgorithms;
exports.Sha = Sha;
