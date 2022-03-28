from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

# エンドポイントのパスの定義
CREATE_USER_URL = '/api/create/'
PROFILE_URL = '/api/profile/'
TOKEN_URL = '/api/auth/'


# 認証済ユーザーでのAPIアクセスのテスト
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
    def test_1_3_should_not_allowed_by_PATCH(self):
        # putで渡す値
        payload = {
            'username': 'dummy',
            'password': 'dummy_pw'
        }
        res = self.client.patch(PROFILE_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

# 未認証ユーザーでのAPIアクセステスト
class UnauthorizedUserApiTests(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_1_4_should_create_new_user(self):
        # postで渡す値
        payload = {
            'username': 'dummy',
            'password': 'dummy_pw'
        }

        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # DBからuserのオブジェクトを取得
        user = get_user_model().objects.get(**res.data)
        self.assertTrue(
            # hash化されたパスワードと一payloadのpasswordと致するか
            user.check_password(payload['password'])
        )
        # responseにはpasswordの情報が含まれないことを確認
        self.assertNotIn('password', res.data)

    # 同じ名前でユーザー作成できないことを確認
    def test_1_5_should_not_create_user_by_same_credentials(self):
        payload = {
            'username': 'dummy',
            'password': 'dummy_pw'
        }
        # 一人目を作成しておく (**payloadで辞書型を引数にして展開)
        get_user_model().objects.create_user(**payload)
        # 二人目を作ろうとして想定通り弾かれるか確認
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # バリデーションにひっかかる短いパスワードではユーザーが作成できないことを確認
    def test_1_6_should_not_create_user_with_invalid_short_pw(self):
        payload = {
            'username': 'dummy',
            'password': 'pw'
        }
        res = self.client.post(CREATE_USER_URL, payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # トークン取得の確認
    def test_1_7_should_response_token(self):
        payload = {
            'username': 'dummy',
            'password': 'dummy_pw'
        }
        get_user_model().objects.create_user(**payload)
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    # 誤ったユーザー認証情報ではTokenが発行されないことの確認
    def test_1_8_should_not_response_token_with_invalid_credentials(self):
        get_user_model().objects.create_user(username='dummy', password='dummy_pw')
        # 誤ったデータ
        payload = {'username': 'dummy', 'password': 'wrong'}
        # 誤ったデータでアクセス
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # 存在しないユーザーではTokenが発行されないことの確認
    def test_1_9_should_not_response_token_with_non_exist_credentials(self):
        # ユーザーを作成せずに、いきなりアクセスする
        payload = {
            'username': 'dummy',
            'password': 'dummy_pw'
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # パスワードが空文字が認証情報として渡された場合もTokenが発行されないことの確認
    def test_1_10_should_not_response_token_with_missing_field(self):
        payload = {
            'username': 'dummy',
            'password': ''
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # 空文字が認証情報として渡された場合もTokenが発行されないことの確認
    def test_1_11_should_not_response_token_with_missing_field(self):
        payload = {
            'username': '',
            'password': ''
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertNotIn('token', res.data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # Tokenがない状態では、profileのエンドポイントアクセスできないことの確認
    def test_1_12_should_not_get_user_profile_when_unauthorized(self):
        res = self.client.get(PROFILE_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)