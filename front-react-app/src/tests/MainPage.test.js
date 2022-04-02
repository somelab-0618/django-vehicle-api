import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import vehicleReducer from '../features/vehicleSlice';
import MainPage from '../components/MainPage';

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
  rest.get('http://localhost:8000/api/profile/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 1, username: 'test user' }));
  }),
  // MainPageコンポーネントが読み込む子コンポーネントがマウント時にアクセスする（useEffect）エンドポイント
  rest.get('http://localhost:8000/api/segments/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
  rest.get('http://localhost:8000/api/brands/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
  rest.get('http://localhost:8000/api/vehicles/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
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

describe('MainPageコンポーネントテスト', () => {
  // test用のストアを定義
  let store;
  // 各テストケースの度に、storeを作成
  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        vehicle: vehicleReducer,
      },
    });
  });

  it('1: すべての要素が正しくレンダリングされている', async () => {
    render(
      <Provider store={store}>
        <MainPage />
      </Provider>
    );
    expect(screen.getAllByTestId('span-title')).toBeTruthy();
    expect(screen.getAllByTestId('btn-logout')).toBeTruthy();
  });

  it('2: ログアウト時はログインページへ遷移する', async () => {
    render(
      <Provider store={store}>
        <MainPage />
      </Provider>
    );
    userEvent.click(screen.getByTestId('btn-logout'));
    expect(mockHistoryPush).toBeCalledWith('/');
    expect(mockHistoryPush).toHaveBeenCalledTimes(1);
  });

  it('3: ログイン後はユーザー名が表示される', async () => {
    render(
      <Provider store={store}>
        <MainPage />
      </Provider>
    );
    // 非同期関数完了前は表示されていない
    expect(screen.queryByText('test user')).toBeNull();
    expect(await screen.findByText('test user')).toBeInTheDocument();
  });
});
