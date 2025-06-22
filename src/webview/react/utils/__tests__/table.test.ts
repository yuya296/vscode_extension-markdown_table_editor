import { parseMarkdownTable2D, generateMarkdownTable2D } from '../table';

describe('table.ts ユーティリティ関数', () => {
    describe('parseMarkdownTable2D', () => {
        it('標準的なMarkdownテーブルを2次元配列に変換できる', () => {
            const md = `| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |`;
            const result = parseMarkdownTable2D(md);
            expect(result).toEqual([
                ['A', 'B'],
                ['1', '2'],
                ['3', '4'],
            ]);
        });
        it('空行や不正な行を無視する', () => {
            const md = `| A | B |\n|---|---|\n| 1 | 2 |\n| | |\n| 3 | 4 |`;
            const result = parseMarkdownTable2D(md);
            expect(result).toEqual([
                ['A', 'B'],
                ['1', '2'],
                ['', ''],
                ['3', '4'],
            ]);
        });
        it('区切り線が異なる場合も許容する', () => {
            const md = `|A|B|\n|-|-|\n|1|2|`;
            const result = parseMarkdownTable2D(md);
            expect(result).toEqual([
                ['A', 'B'],
                ['1', '2'],
            ]);
        });
    });

    describe('generateMarkdownTable2D', () => {
        it('2次元配列からMarkdownテーブル文字列を生成できる', () => {
            const data = [
                ['A', 'B'],
                ['1', '2'],
                ['3', '4'],
            ];
            const md = generateMarkdownTable2D(data);
            expect(md).toContain('| A | B |');
            expect(md).toContain('|---|---|');
            expect(md).toContain('| 1 | 2 |');
            expect(md).toContain('| 3 | 4 |');
        });
        it('空セルや空行も正しく出力できる', () => {
            const data = [
                ['A', 'B'],
                ['', ''],
                ['3', '4'],
            ];
            const md = generateMarkdownTable2D(data);
            expect(md).toContain('|  |  |');
        });
        it('1行のみの場合も区切り線を出力する', () => {
            const data = [
                ['A', 'B'],
            ];
            const md = generateMarkdownTable2D(data);
            expect(md).toContain('|---|---|');
        });
    });
});
