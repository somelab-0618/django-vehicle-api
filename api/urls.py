from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from . import views
from rest_framework.routers import DefaultRouter

# ModelViewSetを継承したviewを登録
router = DefaultRouter()
router.register('segments', views.SegmentViewSet)
router.register('brands', views.BrandViewSet)
router.register('vehicles', views.VehicleViewSet)

app_name = 'api'

# generics関係を継承したviewを登録
urlpatterns = [
    path('create/', views.CreateUserView.as_view(), name='create'),
    path('profile/', views.ProfileUserView.as_view(), name='profile'),
    path('auth/', obtain_auth_token, name='auth'),
    path('', include(router.urls)),
]