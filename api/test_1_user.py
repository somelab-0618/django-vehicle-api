from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

# エンドポイントのパスの定義
CREATE_USER_URL = '/api/create/'
PROFILE_URL = '/api/profile/'
TOKEN_URL = '/api/auth/'


# 認証済ユーザーのテスト
class AuthorizerApiTests(TestCase):
    # テスト前の準備
    def setUp(self):
        # テスト用ユーザー作成
        self.user = get_user_model().objects.create_user(username='dummy', password='dummy_pw')
        # テスト用のAPIクライアント作成(テスト時にAPIにアクセスする)
        self.client = APIClient()
        # 認証を強制的に通す
        self.client.force_authenticate(user=self.user)

    def test_1_1_should_get_user_profile(self):
        # GETリクエスト
        res = self.client.get(PROFILE_URL)

        # responseが200であることを確認
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # user情報が、setUpで作られたuserと一致するか確認
        self.assertEqual(res.data, {
            'id': self.user.id,
            'username': self.user.username,
        })

    # PUTが許可されていないことをテスト
    def test_1_2_should_not_allowed_by_PUT(self):
        # putで渡す値
        payload = {
            'username': 'dummy',
            'password': 'dummy_pw'
        }
        res = self.client.put(PROFILE_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    # PATCHが許可されていないことをテスト
    def test_1_2_should_not_allowed_by_PATCH(self):
        # putで渡す値
        payload = {
            'username': 'dummy',
            'password': 'dummy_pw'
        }
        res = self.client.patch(PROFILE_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

