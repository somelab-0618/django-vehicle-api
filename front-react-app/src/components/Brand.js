import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAsyncGetBrands,
  fetchAsyncCreateBrand,
  fetchAsyncDeleteBrand,
  fetchAsyncUpdateBrand,
  editBrand,
  selectBrands,
  selectEditedBrand,
} from '../features/vehicleSlice';

import styles from './Brand.module.css';

const Brand = () => {
  const dispatch = useDispatch();
  const brands = useSelector(selectBrands);
  const editedBrand = useSelector(selectEditedBrand);
  const [successMsg, setSuccessMsg] = useState('');
  const initialBrand = {
    id: 0,
    brand_name: '',
  };

  useEffect(() => {
    const fetchBootLoader = async () => {
      const result = await dispatch(fetchAsyncGetBrands());
      if (fetchAsyncGetBrands.rejected.match(result)) {
        setSuccessMsg('Brandの取得でエラーが発生しました');
      }
    };
    fetchBootLoader();
  }, [dispatch]);
  return (
    <>
      <h3 data-testid='h3-brand'>Brand</h3>
      <span className={styles.brand__status}>{successMsg}</span>
      <div>
        <input
          type='text'
          placeholder='new brand name'
          value={editedBrand.brand_name}
          onChange={async (e) => {
            await dispatch(
              editBrand({ ...editedBrand, brand_name: e.target.value })
            );
          }}
        />
        <button
          data-testid='btn-post'
          disabled={!editedBrand.brand_name}
          onClick={
            editedBrand.id === 0
              ? async () => {
                  await dispatch(
                    fetchAsyncCreateBrand({
                      brand_name: editedBrand.brand_name,
                    })
                  );
                  await dispatch(editBrand(initialBrand));
                }
              : async () => {
                  const result = await dispatch(fetchAsyncUpdateBrand(editedBrand));
                  await dispatch(editBrand(initialBrand));
                  if (fetchAsyncUpdateBrand.fulfilled.match(result)) {
                    setSuccessMsg('brandを更新しました。');
                  }
                }
          }
        >
          {editedBrand.id === 0 ? 'Create' : 'Update'}
        </button>
        <ul>
          {brands.map((brand) => (
            <li className={styles.brand__item} key={brand.id}>
              <span data-testid={`list-${brand.id}`}>{brand.brand_name}</span>
              <div>
                <button
                  data-testid={`delete-brand-${brand.id}`}
                  onClick={async () => {
                    const result = await dispatch(fetchAsyncDeleteBrand(brand.id));
                    if (fetchAsyncDeleteBrand.fulfilled.match(result)) {
                      setSuccessMsg('brandを削除しました。');
                    }
                  }}
                >
                  delete
                </button>
                <button
                  data-testid={`edit-brand-${brand.id}`}
                  onClick={async () => {
                    await dispatch(editBrand(brand));
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

export default Brand;
