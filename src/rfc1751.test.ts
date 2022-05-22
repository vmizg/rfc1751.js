import { btoe, etob } from '.';

const sampleText =
    'Nulla tristique turpis purus, at dictum nulla convallis ac. Aliquam erat volutpat. Nulla ac sollicitudin purus, et tristique ipsum. Cras rhoncus quam ac fringilla rhoncus. Praesent mattis tincidunt ligula, a sodales dolor mattis eu. Integer tincidunt ex sit amet neque malesuada, sit amet vestibulum ipsum vehicula. Nulla facilisi.';
const textEncoder = new TextEncoder();
const rawText = textEncoder.encode(sampleText);
const words =
    'ARTS LAWN HIT NAVY BIB RUE COIL HOYT HEY SOUR BENT GRID DOCK LAWS HUFF ROUT PAP RIP DOOR HANS BOON BING BAR MEND JO LAW BLAB TELL BESS GRID DADE LAWN HIT NAVY BAT MARY DADE LOST BOHR SEEN HERO GRID BUSS HAW GAGE FLOC NUMB MAUL DOOR CON ACHE QUIT LOW MERT JO LOWE SHOW THUG YES OWE DISK DEAN FEW THUD OBEY OW JO COD OLIN TACT WALT RAN COIL HOB BORE THUD YAP MARE JO FOGY BOOK THUG PEG DUN CHAW JERK ICY SUIT HERO MEND COIL GINA BLOB TIN HERE RYE DOOR COIL GAGE FUEL LOW MELT JO HAND HOP SINK RET MEET JO GINA BING SHED BAR LOGE JO PHI HOOD SINK DRAG MALE CREW BUG HUH ROAR WAND PAM DOOR HOLD GAGE JEFF LOW LOSS DING NEE HURD TIN SALK MERT DOCK ALTO OLIN TEET HERD PAL COIL LED BOLT TEAR BEG POW CLAW LAWN GYP BING BAR GREW DING ELLA GYP SEEN BETH GREW CAVE EMIL HOP STUB BEG LOAF DOCK JUDE BOON TIN BHOY HESS JIM ALSO HURD QUAD DOWN MEAN JO JUDE BOLT OBEY HEFT SAY DADE JERK HAT TRUE BEY LURK DISK ARC BOLD QUIT TOY RET CHAW GINA BLOB TIN SALK MAIL CHAW HOYT BING ONLY FAN DUG DING ALUM BOG NECK SAME MEND JO LOUD BOON TEET HEEL SAY CREW LAWN ACHE ROUT BEY MESH CUFF AS HOFF ROAR HEEL MESH CREW BUS GAGE HUNT BESS RAP BURY ARE HILT OBEY HERB POE DING AGEE FILE A A A';
const wordArray = words.split(' ');

/** Pads array with zeros to the nearest byte */
const getPaddedArray = (arr: Uint8Array) => {
    const padding = 8 - (arr.length % 8);
    if (padding < 8) {
        const padded = new Uint8Array(arr.length + padding);
        padded.set(arr, 0);
        padded.set(new Uint8Array(padding), arr.length);
        return padded;
    }
    return arr;
};

describe('rfc1751', () => {
    it('correctly encodes data', () => {
        expect(btoe(rawText)).toEqual(words);
    });

    it('correctly decodes data', () => {
        expect(etob(words)).toEqual(getPaddedArray(rawText));
    });

    it('throws error on words that are not a multiple of 6', () => {
        const wrongWords = [...wordArray];
        const throwable = () => {
            return etob(wrongWords.join(' '));
        };

        wrongWords.splice(0, 1); // Delete one word to make it not a multiple of 6
        expect(throwable).toThrow('Parity error at COIL');

        wrongWords.splice(0, 4);
        expect(throwable).toThrow('Parity error at PAP');

        wrongWords.splice(0, 1); // Back to a multiple of 6
        expect(throwable()).toBeTruthy();
    });

    it('throws error on words that are not compliant', () => {
        const wrongWords = [...wordArray];
        const throwable = () => {
            return etob(wrongWords.join(' '));
        };

        wrongWords.splice(0, 1, 'SOMETHING'); // Delete one word and insert custom data
        expect(throwable).toThrow(
            'Words must be between 1 and 4 characters long'
        );

        wrongWords.splice(0, 1, 'ANOTHER');
        expect(throwable).toThrow(
            'Words must be between 1 and 4 characters long'
        );

        wrongWords.splice(0, 1, '');
        expect(throwable).toThrow(
            'Words must be between 1 and 4 characters long'
        );
    });
});
