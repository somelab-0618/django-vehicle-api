import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAsyncGetVehicles,
  fetchAsyncCreateVehicle,
  fetchAsyncDeleteVehicle,
  fetchAsyncUpdateVehicle,
  editVehicle,
  selectSegments,
  selectBrands,
  selectVehicles,
  selectEditedVehicle,
} from '../features/vehicleSlice';

import styles from './Vehicle.module.css';
const Vehicle = () => {
  const dispatch = useDispatch();
  const segments = useSelector(selectSegments);
  const brands = useSelector(selectBrands);
  const vehicles = useSelector(selectVehicles);
  const editedVehicle = useSelector(selectEditedVehicle);
  const [successMsg, setSuccessMsg] = useState('');

  const initialVehicle = {
    id: 0,
    vehicle_name: '',
    release_year: 2020,
    price: 0.0,
    segment: 0,
    brand: 0,
  };

  const segmentOptions = segments?.map((seg) => (
    <option key={seg.id} value={seg.id}>
      {seg.segment_name}
    </option>
  ));

  const brandOptions = brands?.map((brand) => (
    <option key={brand.id} value={brand.id}>
      {brand.brand_name}
    </option>
  ));

  useEffect(() => {
    const fetchBootLoader = async () => {
      const result = await dispatch(fetchAsyncGetVehicles());
      if (fetchAsyncGetVehicles.rejected.match(result)) {
        setSuccessMsg('Vehicleの取得でエラーが発生しました');
      }
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <>
      <h3 data-testid='h3-vehicle'>Vehicle</h3>
      <span className={styles.vehicle__status}>{successMsg}</span>
      <div className={styles.vehicle__input}>
        <input
          type='text'
          placeholder='new Vehicle name'
          value={editedVehicle.vehicle_name}
          onChange={async (e) => {
            await dispatch(
              editVehicle({ ...editedVehicle, vehicle_name: e.target.value })
            );
          }}
        />
        <input
          type='number'
          placeholder='year of release'
          min='0'
          value={editedVehicle.release_year}
          onChange={async (e) => {
            await dispatch(
              editVehicle({ ...editedVehicle, release_year: e.target.value })
            );
          }}
        />
        <input
          type='number'
          placeholder='price'
          min='0'
          step='0.01'
          value={editedVehicle.price}
          onChange={async (e) => {
            await dispatch(editVehicle({ ...editedVehicle, price: e.target.value }));
          }}
        />
        <select
          data-testid='select-segment'
          value={editedVehicle.segment}
          onChange={(e) =>
            dispatch(editVehicle({ ...editedVehicle, segment: e.target.value }))
          }
        >
          <option value={0}>Segment</option>
          {segmentOptions}
        </select>
        <select
          data-testid='select-brand'
          value={editedVehicle.brand}
          onChange={(e) =>
            dispatch(editVehicle({ ...editedVehicle, brand: e.target.value }))
          }
        >
          <option value={0}>Brand</option>
          {brandOptions}
        </select>
        <button
          data-testid='btn-vehicle-post'
          disabled={
            !editedVehicle.vehicle_name |
            !editedVehicle.segment |
            !editedVehicle.brand
          }
          onClick={
            editedVehicle.id === 0
              ? async () => {
                  await dispatch(fetchAsyncCreateVehicle(editedVehicle));
                  await dispatch(editVehicle(initialVehicle));
                }
              : async () => {
                  const result = await dispatch(
                    fetchAsyncUpdateVehicle(editedVehicle)
                  );
                  await dispatch(editVehicle(initialVehicle));
                  console.log('initialize');
                  if (fetchAsyncUpdateVehicle.fulfilled.match(result)) {
                    setSuccessMsg('Vehicleを更新しました。');
                  }
                }
          }
        >
          {editedVehicle.id === 0 ? 'Create' : 'Update'}
        </button>
        <ul>
          {vehicles.map((vehicle) => (
            <li className={styles.vehicle__item} key={vehicle.id}>
              <span data-testid={`list-${vehicle.id}`}>
                <strong data-testid={`name-${vehicle.id}`}>
                  {vehicle.vehicle_name}
                </strong>
                ---{vehicle.release_year}--- ${vehicle.price}
                [M] ---
                {vehicle.segment_name} {vehicle.brand_name}---
              </span>
              <div>
                <button
                  data-testid={`delete-vehicle-${vehicle.id}`}
                  onClick={async () => {
                    const result = await dispatch(
                      fetchAsyncDeleteVehicle(vehicle.id)
                    );
                    if (fetchAsyncDeleteVehicle.fulfilled.match(result)) {
                      setSuccessMsg('brandを削除しました。');
                    }
                  }}
                >
                  delete
                </button>
                <button
                  data-testid={`edit-brand-${vehicle.id}`}
                  onClick={async () => {
                    await dispatch(editVehicle(vehicle));
                  }}
                >
                  edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Vehicle;
