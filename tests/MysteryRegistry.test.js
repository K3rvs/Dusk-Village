const { MYSTERIES } = require('../src/server/MysteryRegistry');

describe('MysteryRegistry', () => {
    test('contains all 5 UNESCO MIL Mysteries', () => {
        expect(MYSTERIES).toHaveLength(5);
    });

    test('each mystery has claim, context, and source fragments', () => {
        MYSTERIES.forEach(mystery => {
            expect(mystery.id).toBeDefined();
            expect(mystery.milTheme).toBeDefined();
            expect(mystery.fragments.claim).toBeDefined();
            expect(mystery.fragments.context).toBeDefined();
            expect(mystery.fragments.source).toBeDefined();
        });
    });
});
