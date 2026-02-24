/**
 * Convert a number to words using the BD/Indian number system (Lakh, Crore).
 */
export function numberToWords(num: number): string {
    const ones = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen',
    ];
    const tens = [
        '',
        '',
        'Twenty',
        'Thirty',
        'Forty',
        'Fifty',
        'Sixty',
        'Seventy',
        'Eighty',
        'Ninety',
    ];

    if (num === 0) return 'Zero';

    const numInt = Math.floor(num);

    if (numInt < 20) return ones[numInt];
    if (numInt < 100)
        return tens[Math.floor(numInt / 10)] + (numInt % 10 ? ' ' + ones[numInt % 10] : '');
    if (numInt < 1000)
        return (
            ones[Math.floor(numInt / 100)] +
            ' Hundred' +
            (numInt % 100 ? ' ' + numberToWords(numInt % 100) : '')
        );
    if (numInt < 100000)
        return (
            numberToWords(Math.floor(numInt / 1000)) +
            ' Thousand' +
            (numInt % 1000 ? ' ' + numberToWords(numInt % 1000) : '')
        );
    if (numInt < 10000000)
        return (
            numberToWords(Math.floor(numInt / 100000)) +
            ' Lakh' +
            (numInt % 100000 ? ' ' + numberToWords(numInt % 100000) : '')
        );

    return (
        numberToWords(Math.floor(numInt / 10000000)) +
        ' Crore' +
        (numInt % 10000000 ? ' ' + numberToWords(numInt % 10000000) : '')
    );
}
