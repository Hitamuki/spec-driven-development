import '@testing-library/jest-dom';

// URL.createObjectURL は jsdom に未実装のためスタブを設定する
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-object');
global.URL.revokeObjectURL = vi.fn();
