/* CyberTools — shared page bootstrap.
 * Reads data attributes from <body> and initializes the shell plus page-specific
 * restore hooks that used to live in inline scripts.
 */
(function (CT) {
    'use strict';

    function byId(id) {
        return document.getElementById(id);
    }

    function click(id) {
        var el = byId(id);
        if (el) el.click();
    }

    function setValue(id, value) {
        var el = byId(id);
        if (el) el.value = value;
    }

    function restoreInput(inputId, buttonId) {
        var state = CT.decodeState && CT.decodeState();
        if (state && state.input) {
            setValue(inputId, state.input);
            click(buttonId);
        }
    }

    function initGoogleDorks() {
        if (typeof window.initCatTabs === 'function') window.initCatTabs();
        if (typeof window.renderDorks === 'function') window.renderDorks();
        if (typeof window.buildQuery === 'function') window.buildQuery();
    }

    function initPayloadLibrary() {
        if (typeof window.initTabs === 'function') window.initTabs();
        if (typeof window.render === 'function') window.render();
    }

    function initHexViewer() {
        var input = byId('fileInput');
        if (input === null) return;
        input.addEventListener('change', function () {
            var name = byId('ct-filename');
            if (name && this.files[0]) name.textContent = this.files[0].name;
        });
    }

    function initSteganography() {
        var encodeImage = byId('encodeImage');
        var decodeImage = byId('decodeImage');
        if (encodeImage) {
            encodeImage.addEventListener('change', function () {
                var canvas = byId('encodeCanvas');
                if (canvas) canvas.style.display = 'block';
            });
        }
        if (decodeImage) {
            decodeImage.addEventListener('change', function () {
                var canvas = byId('decodeCanvas');
                if (canvas) canvas.style.display = 'block';
            });
        }

        var dl = byId('downloadLink');
        if (dl && dl.href) dl.style.display = 'inline';

        var origEncode = window.encodeMessage;
        if (typeof origEncode === 'function') {
            window.encodeMessage = function () {
                origEncode();
                setTimeout(function () {
                    var link = byId('downloadLink');
                    if (link && link.href) link.style.display = 'inline';
                }, 100);
            };
        }
    }

    function runToolInit(activeTool) {
        switch (activeTool) {
            case 'base64':
                restoreInput('encodeText', 'encodeBtn');
                break;
            case 'hash':
                restoreInput('hashInput', 'hashBtn');
                break;
            case 'json-formatter':
                restoreInput('jsonInput', 'formatBtn');
                break;
            case 'jwt':
                var state = CT.decodeState && CT.decodeState();
                if (state && state.token) {
                    setValue('jwtInput', state.token);
                    click('decodeBtn');
                }
                break;
            case 'rot':
                var rotState = CT.decodeState && CT.decodeState();
                if (rotState && rotState.input) {
                    setValue('input', rotState.input);
                    if (typeof window.run === 'function') window.run();
                }
                break;
            case 'timestamp':
                restoreInput('tsInput', 'convertBtn');
                break;
            case 'url-encoder':
                restoreInput('urlInput', 'encodeBtn');
                break;
            case 'hex-viewer':
                initHexViewer();
                break;
            case 'steganography':
                initSteganography();
                break;
            case 'google-dorks':
                initGoogleDorks();
                break;
            case 'reverse-shell':
                if (typeof window.renderAll === 'function') window.renderAll();
                break;
            case 'sqli-payloads':
            case 'xss-payloads':
                initPayloadLibrary();
                break;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var body = document.body;
        var activeTool = body.getAttribute('data-ct-active-tool') || '';
        var toolSourcePath = body.getAttribute('data-ct-tool-source') || '';

        if (CT.initShell) {
            CT.initShell({ activeTool: activeTool, toolSourcePath: toolSourcePath });
        }

        if (window.CyberToolsRenderToolsIndex) {
            window.CyberToolsRenderToolsIndex('');
        }

        runToolInit(activeTool);
    });
})(window.CyberTools = window.CyberTools || {});
