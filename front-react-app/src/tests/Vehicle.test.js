import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import vehicleReducer from '../features/vehicleSlice';
import Vehicle from '../components/Vehicle';
import Brand from '../components/Brand';
import Segment from '../components/Segment';

const handlers = [
  rest.get('http://localhost:8000/api/segments/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, segment_name: 'SUV' },
        { id: 2, segment_name: 'EV' },
      ])
    );
  }),
  rest.get('http://localhost:8000/api/brands/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, brand_name: 'Audi' },
        { id: 2, brand_name: 'Tesla' },
      ])
    );
  }),
  rest.delete('http://localhost:8000/api/segments/1/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.delete('http://localhost:8000/api/segments/2/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.delete('http://localhost:8000/api/brands/1/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.delete('http://localhost:8000/api/brands/2/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get('http://localhost:8000/api/vehicles/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          vehicle_name: 'SQ7',
          release_year: 2019,
          price: 300.12,
          segment: 1,
          brand: 1,
          segment_name: 'SUV',
          brand_name: 'Audi',
        },
        {
          id: 2,
          vehicle_name: 'MODEL S',
          release_year: 2020,
          price: 400.12,
          segment: 2,
          brand: 2,
          segment_name: 'EV',
          brand_name: 'Tesla',
        },
      ])
    );
  }),
  rest.post('http://localhost:8000/api/vehicles/', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        vehicle_name: 'MODEL X',
        release_year: 2019,
        price: 350.12,
        segment: 2,
        brand: 2,
        segment_name: 'EV',
        brand_name: 'Tesla',
      })
    );
  }),
  rest.put('http://localhost:8000/api/vehicles/1/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        vehicle_name: 'update SQ7',
        release_year: 2019,
        price: 300.12,
        segment: 1,
        brand: 1,
        segment_name: 'SUV',
        brand_name: 'Audi',
      })
    );
  }),
  rest.put('http://localhost:8000/api/vehicles/2/', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 2,
        vehicle_name: 'update MODEL S',
        release_year: 2020,
        price: 400.12,
        segment: 2,
        brand: 2,
        segment_name: 'EV',
        brand_name: 'Tesla',
      })
    );
  }),
  rest.delete('http://localhost:8000/api/vehicles/1/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.delete('http://localhost:8000/api/vehicles/2/', (req, res, ctx) => {
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

describe('Vehicle Component Test CAses', () => {
  let store;
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
        <Vehicle />
      </Provider>
    );
    expect(screen.getByTestId('h3-vehicle')).toBeTruthy();
    expect(screen.getByPlaceholderText('new vehicle name')).toBeTruthy();
    expect(screen.getByPlaceholderText('year of release')).toBeTruthy();
    expect(screen.getByPlaceholderText('price')).toBeTruthy();
    expect(screen.getByTestId('select-segment')).toBeTruthy();
    expect(screen.getByTestId('select-brand')).toBeTruthy();
    expect(screen.getByTestId('btn-vehicle-post')).toBeTruthy();
    expect(await screen.findByText('SQ7')).toBeTruthy();
    expect(screen.getAllByRole('listitem')[0]).toBeTruthy();
    expect(screen.getAllByRole('listitem')[1]).toBeTruthy();
    expect(screen.getByTestId('delete-veh-1')).toBeTruthy();
    expect(screen.getByTestId('delete-veh-2')).toBeTruthy();
    expect(screen.getByTestId('edit-veh-1')).toBeTruthy();
    expect(screen.getByTestId('edit-veh-2')).toBeTruthy();
  });

  it('2: APIのsegmentsのレスポンスがリストで正しく表示されている', async () => {
    render(
      <Provider store={store}>
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
  });

  it('3: APIへのアクセスが失敗した場合はリストが表示されていない', async () => {
    server.use(
      rest.get('http://localhost:8000/api/vehicles/', (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    render(
      <Provider store={store}>
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後
    expect(
      await screen.findByText('Vehicleの取得でエラーが発生しました')
    ).toBeInTheDocument();
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
  });

  it('4: 新たにVehicleを追加すると、リストに表示される', async () => {
    render(
      <Provider store={store}>
        <Brand />
        <Segment />
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('MODEL X')).toBeNull();
    // 非同期関数完了後
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    const inputValue = screen.getByPlaceholderText('new vehicle name');
    userEvent.type(inputValue, 'MODEL X');
    userEvent.selectOptions(screen.getByTestId('select-segment'), '2');
    userEvent.selectOptions(screen.getByTestId('select-brand'), '2');
    userEvent.click(screen.getByTestId('btn-vehicle-post'));
    expect(await screen.findByText('MODEL X')).toBeInTheDocument();
  });

  it('5: vehicle（id:1）のdeleteボタンをクリックすると、リストから削除される', async () => {
    render(
      <Provider store={store}>
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('delete-veh-1'));
    expect(await screen.findByText('vehicleを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('SQ7')).toBeNull();
  });

  it('6: vehicle（id:2）のdeleteボタンをクリックすると、リストから削除される', async () => {
    render(
      <Provider store={store}>
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('delete-veh-2'));
    expect(await screen.findByText('vehicleを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('MODEL S')).toBeNull();
  });

  it('7: vehicle（id:1）の内容を更新すると、リストも更新される', async () => {
    render(
      <Provider store={store}>
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('edit-veh-1'));
    const inputValue = screen.getByPlaceholderText('new vehicle name');
    userEvent.click(inputValue, 'update SQ7');
    userEvent.click(screen.getByTestId('btn-vehicle-post'));
    expect(await screen.findByText('Vehicleを更新しました。')).toBeInTheDocument();
    expect(screen.getByTestId('name-1').textContent).toBe('update SQ7');
  });

  it('8: vehicle（id:1）の内容を更新すると、リストも更新される', async () => {
    render(
      <Provider store={store}>
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('edit-veh-2'));
    const inputValue = screen.getByPlaceholderText('new vehicle name');
    userEvent.click(inputValue, 'update MODEL S');
    userEvent.click(screen.getByTestId('btn-vehicle-post'));
    expect(await screen.findByText('Vehicleを更新しました。')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('update MODEL S');
  });

  it('9: [CASCADE DELETE]segmentのEV（id:2）を削除すると、vehicleのMODEL S(id:2)も更新される', async () => {
    render(
      <Provider store={store}>
        <Brand />
        <Segment />
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('delete-seg-2'));
    expect(await screen.findByText('segmentを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('MODEL S')).toBeNull();
    expect(screen.getByTestId('name-1').textContent).toBe('SQ7');
  });

  it('10: [CASCADE DELETE]brandのTesla（id:2）を削除すると、vehicleのMODEL S(id:2)も更新される', async () => {
    render(
      <Provider store={store}>
        <Brand />
        <Segment />
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('delete-brand-2'));
    expect(await screen.findByText('brandを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('MODEL S')).toBeNull();
    expect(screen.getByTestId('name-1').textContent).toBe('SQ7');
  });

  it('11: [CASCADE DELETE]segmentのSUV（id:1）を削除すると、vehicleのSQ7(id:1)も更新される', async () => {
    render(
      <Provider store={store}>
        <Brand />
        <Segment />
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('delete-seg-1'));
    expect(await screen.findByText('segmentを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
  });

  it('11: [CASCADE DELETE]brandのAudi（id:1）を削除すると、vehicleのSQ7(id:1)も更新される', async () => {
    render(
      <Provider store={store}>
        <Brand />
        <Segment />
        <Vehicle />
      </Provider>
    );
    // 非同期関数完了前
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.queryByText('MODEL S')).toBeNull();
    // 非同期関数完了後 (削除前の状態を確認)
    expect(await screen.findByText('SQ7')).toBeInTheDocument();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
    userEvent.click(screen.getByTestId('delete-brand-1'));
    expect(await screen.findByText('brandを削除しました。')).toBeInTheDocument();
    expect(screen.queryByText('SQ7')).toBeNull();
    expect(screen.getByTestId('name-2').textContent).toBe('MODEL S');
  });
});
