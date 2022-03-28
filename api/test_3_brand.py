from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from .models import Brand
from .serializers import BrandSerializer

BRANDS_URL = '/api/brands/'


# brandを作成する関数
def create_brand(brand_name):
    return Brand.objects.create(brand_name=brand_name)


# urlを作成する関数(末尾にIDを追加する形)
def detail_url(brand_id):
    return reverse('api:brand-detail', args=[brand_id])


# Token認証済のユーザーによるAPIアクセスのテスト
class AuthorizedBrandApiTests(TestCase):
    # テスト前の準備
    def setUp(self):
        # テスト用ユーザー作成
        self.user = get_user_model().objects.create_user(username='dummy', password='dummy_pw')
        # テスト用のAPIクライアント作成(テスト時にAPIにアクセスする)
        self.client = APIClient()
        # 認証を強制的に通す
        self.client.force_authenticate(user=self.user)

    # Brand一覧取得のテスト
    def test_3_1_should_get_all_brands(self):
        create_brand(brand_name='Toyota')
        create_brand(brand_name='Testra')
        res = self.client.get(BRANDS_URL)
        # DBからSegmentのデータを取得
        segments = Brand.objects.all().order_by('id')
        # Serializerで辞書型にする
        serializer = BrandSerializer(segments, many=True)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    # 単一のブランドを取得できるか
    def test_3_2_should_get_single_brand(self):
        brand = create_brand(brand_name='Toyota')
        url = detail_url(brand.id)
        res = self.client.get(url)
        serializer = BrandSerializer(brand)
        self.assertEqual(res.data, serializer.data)

    # 新規でブランドを作成できるか
    def test_3_3_should_create_new_brand_successfully(self):
        payload = {'brand_name': 'Audi'}
        res = self.client.post(BRANDS_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        exists = Brand.objects.filter(brand_name=payload['brand_name']).exists()
        self.assertTrue(exists)

    # 値が空のデータでBrandを新規で作成できない確認
    def test_3_4_should_not_create_new_segment_invalid(self):
        payload = {'brand_name': ''}
        res = self.client.post(BRANDS_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # PATCHの確認
    def test_3_5_should_partial_update_brand(self):
        brand = create_brand(brand_name='Toyota')
        payload = {'brand_name': 'Honda'}
        url = detail_url(brand.id)
        self.client.patch(url, payload)
        # 最新のDBの内容を反映させる
        brand.refresh_from_db()
        self.assertEqual(brand.brand_name, payload['brand_name'])

    # PUTの確認
    def test_3_6_should_partial_brand(self):
        brand = create_brand(brand_name='Toyota')
        payload = {'brand_name': 'Honda'}
        url = detail_url(brand.id)
        self.client.put(url, payload)
        # 最新のDBの内容を反映させる
        brand.refresh_from_db()
        self.assertEqual(brand.brand_name, payload['brand_name'])

    # DELETEの確認
    def test_3_7_should_delete_brand(self):
        segment = create_brand(brand_name='Toyota')
        self.assertEqual(1, Brand.objects.count())
        url = detail_url(segment.id)
        self.client.delete(url)
        self.assertEqual(0, Brand.objects.count())


# Token未承認ユーザーでのAPIアクセスのテスト
class UnauthorizedBrandApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    # 未承認ユーザーではセグメントを取得できない
    def test_2_8_should_not_get_brand_when_unauthorized(self):
        res = self.client.get(BRANDS_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)