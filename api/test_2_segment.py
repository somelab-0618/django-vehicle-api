from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from .models import Segment
from .serializers import SegmentSerializer

SEGMENTS_URL = '/api/segments/'


# segmentを作成する関数
def create_segment(segment_name):
    return Segment.objects.create(segment_name=segment_name)


# urlを作成する関数(末尾にIDを追加する形)
def detail_url(segment_id):
    return reverse('api:segment-detail', args=[segment_id])


# Token認証済のユーザーによるAPIアクセスのテスト
class AuthorizedSegmentApiTests(TestCase):
    # テスト前の準備
    def setUp(self):
        # テスト用ユーザー作成
        self.user = get_user_model().objects.create_user(username='dummy', password='dummy_pw')
        # テスト用のAPIクライアント作成(テスト時にAPIにアクセスする)
        self.client = APIClient()
        # 認証を強制的に通す
        self.client.force_authenticate(user=self.user)

    # Segment一覧取得のテスト
    def test_2_1_should_get_all_segments(self):
        create_segment(segment_name='SUV')
        create_segment(segment_name='Sedan')
        res = self.client.get(SEGMENTS_URL)
        # DBからSegmentのデータを取得
        segments = Segment.objects.all().order_by('id')
        # Serializerで辞書型にする
        serializer = SegmentSerializer(segments, many=True)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, serializer.data)

    # 単一のセグメントを取得できるか
    def test_2_2_should_get_single_segment(self):
        segment = create_segment(segment_name='SUV')
        url = detail_url(segment.id)
        res = self.client.get(url)
        serializer = SegmentSerializer(segment)
        self.assertEqual(res.data, serializer.data)

    # 新規でセグメントを作成できるか
    def test_2_3_should_create_new_segment_successfully(self):
        payload = {'segment_name': 'K-Car'}
        res = self.client.post(SEGMENTS_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        exists = Segment.objects.filter(segment_name=payload['segment_name']).exists()
        self.assertTrue(exists)

    # 値が空のデータでSegmentを新規で作成できない確認
    def test_2_3_should_not_create_new_segment_invalid(self):
        payload = {'segment_name': ''}
        res = self.client.post(SEGMENTS_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # PATCHの確認
    def test_2_5_should_partial_update_segment(self):
        segment = create_segment(segment_name='SUV')
        payload = {'segment_name': 'Compact SUV'}
        url = detail_url(segment.id)
        self.client.patch(url, payload)
        # 最新のDBの内容を反映させる
        segment.refresh_from_db()
        self.assertEqual(segment.segment_name, payload['segment_name'])

    # PUTの確認
    def test_2_6_should_partial_segment(self):
        segment = create_segment(segment_name='SUV')
        payload = {'segment_name': 'Compact SUV'}
        url = detail_url(segment.id)
        self.client.put(url, payload)
        # 最新のDBの内容を反映させる
        segment.refresh_from_db()
        self.assertEqual(segment.segment_name, payload['segment_name'])

    # DELETEの確認
    def test_2_7_should_delete_segment(self):
        segment = create_segment(segment_name='SUV')
        self.assertEqual(1, Segment.objects.count())
        url = detail_url(segment.id)
        self.client.delete(url)
        self.assertEqual(0, Segment.objects.count())


# Token未承認ユーザーでのAPIアクセスのテスト
class UnauthorizedSegmentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    # 未承認ユーザーではセグメントを取得できない
    def test_2_8_should_not_get_segments_when_unauthorized(self):
        res = self.client.get(SEGMENTS_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)