import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from '../features/vehicleSlice';
import Brand from '../components/Brand';

const handlers = [
  rest.get('http://localhost:8000/api/brands/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, brand_name: 'Toyota' },
        { id: 2, brand_name: 'Tesla' },
      ])
    );
  }),
  rest.post('http://localhost:8000/api/brands/', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 3, brand_name: 'Audi' }));
  }),
  rest.put('http://localhost:8000/api/brands/1/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 1, brand_name: 'update Toyota' }));
  }),
  rest.put('http://localhost:8000/api/brands/2/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 2, brand_name: 'update Tesla' }));
  }),
  rest.delete('http://localhost:8000/api/brands/1/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.delete('http://localhost:8000/api/brands/2/', (req, res, ctx) => {
    return res(ctx.status(200));
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

describe('Brandコンポーネントテスト', () => {
  // test用のストアを定義
  let store;
  // 各テストケースの度に、storeを作成
  beforeEach(() => {
    store = configureStore({
      reducer: {
        vehicle: vehicleReducer,
      },
    });
  });
  it('1: すべての要素が正しくレンダリングされている', async () => {
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    expect(screen.getByTestId('h3-brand')).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByTestId('btn-post')).toBeTruthy();
    // 非同期関数完了後
    expect(await screen.findByText('Toyota')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')[0]).toBeTruthy();
    expect(screen.getAllByRole('listitem')[1]).toBeTruthy();
    expect(screen.getByTestId('delete-brand-1')).toBeTruthy();
    expect(screen.getByTestId('delete-brand-2')).toBeTruthy();
    expect(screen.getByTestId('edit-brand-1')).toBeTruthy();
    expect(screen.getByTestId('edit-brand-2')).toBeTruthy();
  });

  it('2: APIのbrandsのレスポンスがリストで表示されている', async () => {
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Toyota')).toBeNull();
    expect(screen.queryByText('Tesla')).toBeNull();
    // 非同期関数完了後
    expect(await screen.findByText('Toyota')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('Tesla');
    // expect(screen.getByText('Tesla')).toBeTruthy();
  });

  it('3: APIアクセスに失敗した時はsegmentsのレスポンスがリストで表示されていない', async () => {
    // 失敗にステータス書き換え（このテストケースのみ有効）
    server.use(
      rest.get('http://localhost:8000/api/brands/', (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Toyota')).toBeNull();
    expect(screen.queryByText('Tesla')).toBeNull();
    // 非同期関数完了後
    expect(
      await screen.findByText('Brandの取得でエラーが発生しました')
    ).toBeInTheDocument();
    expect(screen.queryByText('Toyota')).toBeNull();
    expect(screen.queryByText('Tesla')).toBeNull();
  });

  it('4: 新たにブランドを追加すると、リストに表示される', async () => {
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Audi')).toBeNull();
    const inputValue = screen.getByPlaceholderText('new brand name');
    userEvent.type(inputValue, 'Audi');
    userEvent.click(screen.getByTestId('btn-post'));
    expect(await screen.findByText('Audi')).toBeInTheDocument();
  });

  it('5: ブランド（id:1）のdeleteボタンをクリックすると、リストから削除される', async () => {
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Toyota')).toBeNull();
    expect(screen.queryByText('Tesla')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('Toyota')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('Tesla');
    userEvent.click(screen.getByTestId('delete-brand-1'));
    expect(await screen.findByText('brandを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('Toyota')).toBeNull();
  });

  it('6: ブランド（id:2）のdeleteボタンをクリックすると、リストから削除される', async () => {
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Toyota')).toBeNull();
    expect(screen.queryByText('Tesla')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('Toyota')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('Tesla');
    userEvent.click(screen.getByTestId('delete-brand-2'));
    expect(await screen.findByText('brandを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('Tesla')).toBeNull();
  });

  it('7: ブランド（id:1）の内容を更新すると、リストも更新される', async () => {
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Toyota')).toBeNull();
    expect(screen.queryByText('Tesla')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('Toyota')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('Tesla');
    userEvent.click(screen.getByTestId('edit-brand-1'));
    const inputValue = screen.getByPlaceholderText('new brand name');
    userEvent.click(inputValue, 'update Toyota');
    userEvent.click(screen.getByTestId('btn-post'));
    expect(await screen.findByText('brandを更新しました。')).toBeInTheDocument();
    expect(screen.getByTestId('list-1').textContent).toBe('update Toyota');
  });

  it('7: ブランド（id:2）を更新すると、リストも更新される', async () => {
    render(
      <Provider store={store}>
        <Brand />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Toyota')).toBeNull();
    expect(screen.queryByText('Tesla')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('Toyota')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('Tesla');
    userEvent.click(screen.getByTestId('edit-brand-2'));
    const inputValue = screen.getByPlaceholderText('new brand name');
    userEvent.click(inputValue, 'update Tesla');
    userEvent.click(screen.getByTestId('btn-post'));
    expect(await screen.findByText('brandを更新しました。')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('update Tesla');
  });
});
