from rest_framework import serializers
from .models import Segment, Brand, Vehicle
from django.contrib.auth.models import User


# DBの内容をJSONに変換する際に、serializerが作用する
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        # modelの割当
        model = User
        # serializerで取り扱う属性
        fields = ['id', 'username', 'password']
        # 指定した属性への追加の設定
        extra_kwargs = {'password': {'write_only': True, 'required': True, 'min_length': 5}}

    # User作成のcreateメソッドをUserモデルのcreate_userを使用して
    # オーバーライドしパスワードのhash化などをする
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class SegmentSerializer(serializers.ModelSerializer):
    class Meta:
        # modelの割当
        model = Segment
        # serializerで取り扱う属性
        fields = ['id', 'segment_name']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        # modelの割当
        model = Brand
        # serializerで取り扱う属性
        fields = ['id', 'brand_name']


class VehicleSerializer(serializers.ModelSerializer):
    segment_name = serializers.ReadOnlyField(source='segment.segment_name', read_only=True)
    brand_name = serializers.ReadOnlyField(source='brand.brand_name', read_only=True)

    class Meta:
        # modelの割当
        model = Vehicle
        # serializerで取り扱う属性
        fields = ['id', 'vehicle_name', 'release_year', 'price', 'segment', 'brand', 'segment_name', 'brand_name']
        extra_kwargs = {'user': {'read_only': True}}
