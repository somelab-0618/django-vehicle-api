from rest_framework import generics, permissions, viewsets, status
from .serializers import UserSerializer, SegmentSerializer, BrandSerializer, VehicleSerializer
from .models import Segment, Brand, Vehicle
from rest_framework.response import Response

# createに特化したviewを作る場合はgenerics.CreateAPIView
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    # 未承認ユーザーのviewへのアクセスをここだけ許可しておく
    permission_classes = (permissions.AllowAny,)

# ログインしているユーザーのプロフィール情報を返すView
class ProfileUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    # override
    def get_object(self):
        # ログインしているユーザーのオブジェクトを返す
        return self.request.user

    # override 使わせないため
    def update(self, request, *args, **kwargs):
        response = {'message': 'PUT method is not allowed'}
        return Response(response, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        response = {'message': 'PATCH method is not allowed'}
        return Response(response, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class SegmentViewSet(viewsets.ModelViewSet):
    # CRUDを全部使えるようにする
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer

class BrandViewSet(viewsets.ModelViewSet):
    # CRUDを全部使えるようにする
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    # CRUDを全部使えるようにする
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    # vehicleを作成するときにログインユーザーを割り当てるよう
    # overrideする
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

