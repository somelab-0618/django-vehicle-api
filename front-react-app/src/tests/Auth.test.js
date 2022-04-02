import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import Auth from '../components/Auth';

const mockHistoryPush = jest.fn();

// 関数をテスト用に上書き
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

// APIエンドポイントのモック
// 複数のエンドポイントを設定する場合は配列で定義する
const handlers = [
  rest.post('http://localhost:8000/api/auth/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ token: 'abc123' }));
  }),
  rest.post('http://localhost:8000/api/create/', (req, res, ctx) => {
    return res(ctx.status(201));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen();
});
// 各テストケース終了時に実行
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
// すべてのテストケースが終了したら実行
afterAll(() => {
  server.close();
});

describe('Authコンポーネントテスト', () => {
  // test用のストアを定義
  let store;
  // 各テストケースの度に、storeを作成
  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('1: すべての要素が正しくレンダリングされている', async () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );
    // screen.debug();
    expect(screen.getByTestId('label-username')).toBeTruthy();
    expect(screen.getByTestId('label-password')).toBeTruthy();
    expect(screen.getByTestId('input-username')).toBeTruthy();
    expect(screen.getByTestId('input-password')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
    expect(screen.getByTestId('toggle-icon')).toBeTruthy();
  });
  it('2: アイコンのクリックでボタンのテキストが切り替わる', async () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );
    // screen.debug();
    expect(screen.getByRole('button')).toHaveTextContent('Login');
    userEvent.click(screen.getByTestId('toggle-icon'));
    expect(screen.getByRole('button')).toHaveTextContent('Register');
  });
  it('3: ログイン成功時はMainPageへ遷移する', async () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );
    // screen.debug();
    userEvent.click(screen.getByText('Login'));
    expect(await screen.findByText('ログインに成功しました。')).toBeInTheDocument();
    expect(mockHistoryPush).toBeCalledWith('/vehicle');
    expect(mockHistoryPush).toHaveBeenCalledTimes(1);
  });
});
