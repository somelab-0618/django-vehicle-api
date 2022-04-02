import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from '../features/vehicleSlice';
import Segment from '../components/Segment';

const handlers = [
  rest.get('http://localhost:8000/api/segments/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, segment_name: 'K-CAR' },
        { id: 2, segment_name: 'EV' },
      ])
    );
  }),
  rest.post('http://localhost:8000/api/segments/', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 3, segment_name: 'Large SUV' }));
  }),
  rest.put('http://localhost:8000/api/segments/1/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 1, segment_name: 'update K-CAR' }));
  }),
  rest.put('http://localhost:8000/api/segments/2/', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 2, segment_name: 'update EV' }));
  }),
  rest.delete('http://localhost:8000/api/segments/1/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.delete('http://localhost:8000/api/segments/2/', (req, res, ctx) => {
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

describe('Segmentコンポーネントテスト', () => {
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

  it('1: 要素が正しくレンダリングされている', async () => {
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    expect(screen.getByTestId('h3-segment')).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByTestId('btn-post')).toBeTruthy();
    // 非同期関数完了後
    expect(await screen.findByText('K-CAR')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')[0]).toBeTruthy();
    expect(screen.getAllByRole('listitem')[1]).toBeTruthy();
    expect(screen.getByTestId('delete-seg-1')).toBeTruthy();
    expect(screen.getByTestId('delete-seg-2')).toBeTruthy();
    expect(screen.getByTestId('edit-seg-1')).toBeTruthy();
    expect(screen.getByTestId('edit-seg-2')).toBeTruthy();
  });

  it('2: APIのsegmentsのレスポンスがリストで表示されている', async () => {
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    expect(screen.queryByText('K-CAR')).toBeNull();
    expect(screen.queryByText('EV')).toBeNull();
    // 非同期関数完了後
    expect(await screen.findByText('K-CAR')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('EV');
  });

  it('3: APIアクセスに失敗した時はsegmentsのレスポンスがリストで表示されていない', async () => {
    // 失敗にステータス書き換え（このテストケースのみ有効）
    server.use(
      rest.get('http://localhost:8000/api/segments/', (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('K-CAR')).toBeNull();
    expect(screen.queryByText('EV')).toBeNull();
    // 非同期関数完了後
    expect(
      await screen.findByText('Segmentの取得でエラーが発生しました')
    ).toBeInTheDocument();
    expect(screen.queryByText('K-CAR')).toBeNull();
    expect(screen.queryByText('EV')).toBeNull();
  });

  it('4: 新たにセグメントを追加すると、リストに表示される', async () => {
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('Large SUV')).toBeNull();
    const inputValue = screen.getByPlaceholderText('new segment name');
    userEvent.type(inputValue, 'Large SUV');
    userEvent.click(screen.getByTestId('btn-post'));
    expect(await screen.findByText('Large SUV')).toBeInTheDocument();
  });

  it('5: セグメント（id:1）のdeleteボタンをクリックすると、リストから削除される', async () => {
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('K-CAR')).toBeNull();
    expect(screen.queryByText('EV')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('K-CAR')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('EV');
    userEvent.click(screen.getByTestId('delete-seg-1'));
    expect(await screen.findByText('segmentを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('K-CAR')).toBeNull();
  });

  it('6: セグメント（id:2）のdeleteボタンをクリックすると、リストから削除される', async () => {
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('K-CAR')).toBeNull();
    expect(screen.queryByText('EV')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('K-CAR')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('EV');
    userEvent.click(screen.getByTestId('delete-seg-2'));
    expect(await screen.findByText('segmentを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('EV')).toBeNull();
  });

  it('7: セグメント（id:1）の内容を更新すると、リストも更新される', async () => {
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('K-CAR')).toBeNull();
    expect(screen.queryByText('EV')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('K-CAR')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('EV');
    userEvent.click(screen.getByTestId('edit-seg-1'));
    const inputValue = screen.getByPlaceholderText('new segment name');
    userEvent.click(inputValue, 'update K-CAR');
    userEvent.click(screen.getByTestId('btn-post'));
    expect(await screen.findByText('segmentを更新しました。')).toBeInTheDocument();
    expect(screen.getByTestId('list-1').textContent).toBe('update K-CAR');
  });

  it('8: セグメント（id:2）を更新すると、リストも更新される', async () => {
    render(
      <Provider store={store}>
        <Segment />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('K-CAR')).toBeNull();
    expect(screen.queryByText('EV')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('K-CAR')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('EV');
    userEvent.click(screen.getByTestId('edit-seg-2'));
    const inputValue = screen.getByPlaceholderText('new segment name');
    userEvent.click(inputValue, 'update EV');
    userEvent.click(screen.getByTestId('btn-post'));
    expect(await screen.findByText('segmentを更新しました。')).toBeInTheDocument();
    expect(screen.getByTestId('list-2').textContent).toBe('update EV');
  });
});
