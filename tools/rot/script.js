class ROT {
    constructor() {
        this.a = 33;
        this.b = 126;
        this.r = 94;
    }

    rotAlpha(c, s) {
        let code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + s) % 26) + 65);

        if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + s) % 26) + 97);

        return c;
    }

    rotDigit(c, s) {
        let code = c.charCodeAt(0);
        if (code >= 48 && code <= 57) return String.fromCharCode(((code - 48 + s) % 10) + 48);
        return c;
    }

    rotAscii(c, s) {
        let code = c.charCodeAt(0);
        if (code >= this.a && code <= this.b) return String.fromCharCode(this.a + ((code - this.a + s) % this.r));
        return c;
    }

    rotN(t, s) {
        return [...t].map((c) => this.rotAlpha(c, s)).join('');
    }

    rot5(t) {
        return [...t].map((c) => this.rotDigit(c, 5)).join('');
    }

    rot13(t) {
        return this.rotN(t, 13);
    }

    rot18(t) {
        return [...t]
            .map((c) => {
                let code = c.charCodeAt(0);
                if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) return this.rotAlpha(c, 13);
                if (code >= 48 && code <= 57) return this.rotDigit(c, 5);
                return c;
            })
            .join('');
    }

    rot47(t) {
        return [...t].map((c) => this.rotAscii(c, 47)).join('');
    }

    rot48(t) {
        return [...t].map((c) => this.rotAscii(c, 48)).join('');
    }

    // Encryption methods (inverses of the decryption methods above)
    encRot1(t) {
        return this.rotN(t, 25);
    }

    encRot5(t) {
        return this.rot5(t);
    }

    encRot13(t) {
        return this.rot13(t);
    }

    encRot18(t) {
        return this.rot18(t);
    }

    encRot47(t) {
        return this.rot47(t);
    }

    encRot48(t) {
        return [...t].map((c) => this.rotAscii(c, 46)).join('');
    }

    encryptAll(t) {
        return [
            ['ROT1', this.encRot1(t)],
            ['ROT5', this.encRot5(t)],
            ['ROT13', this.encRot13(t)],
            ['ROT18', this.encRot18(t)],
            ['ROT47', this.encRot47(t)],
            ['ROT48', this.encRot48(t)],
        ]
            .map((x) => x[0] + ':\n' + x[1])
            .join('\n\n');
    }

    detect(t) {
        return [
            ['ROT13', this.rot13(t)],
            ['ROT5', this.rot5(t)],
            ['ROT18', this.rot18(t)],
            ['ROT47', this.rot47(t)],
            ['ROT48', this.rot48(t)],
        ]
            .map((x) => x[0] + ':\n' + x[1])
            .join('\n\n');
    }
}

const rot = new ROT();

function run() {
    let text = document.getElementById('input').value;
    let mode = document.getElementById('mode').value;
    let out = '';

    switch (mode) {
        case 'rot1':
            out = rot.rotN(text, 1);
            break;
        case 'rot5':
            out = rot.rot5(text);
            break;
        case 'rot13':
            out = rot.rot13(text);
            break;
        case 'rot18':
            out = rot.rot18(text);
            break;
        case 'rot47':
            out = rot.rot47(text);
            break;
        case 'rot48':
            out = rot.rot48(text);
            break;
        case 'auto':
            out = rot.detect(text);
            break;
    }

    document.getElementById('output').innerText = out;
}

function encrypt() {
    let text = document.getElementById('encInput').value;
    let mode = document.getElementById('encMode').value;
    let out = '';

    switch (mode) {
        case 'rot1':
            out = rot.encRot1(text);
            break;
        case 'rot5':
            out = rot.encRot5(text);
            break;
        case 'rot13':
            out = rot.encRot13(text);
            break;
        case 'rot18':
            out = rot.encRot18(text);
            break;
        case 'rot47':
            out = rot.encRot47(text);
            break;
        case 'rot48':
            out = rot.encRot48(text);
            break;
        case 'all':
            out = rot.encryptAll(text);
            break;
    }

    document.getElementById('encOutput').innerText = out;
}
