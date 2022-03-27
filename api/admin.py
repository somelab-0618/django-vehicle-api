from django.contrib import admin
from .models import Segment, Brand, Vehicle
# Register your models here.

# 管理画面とModelの紐付け
admin.site.register(Segment)
admin.site.register(Brand)
admin.site.register(Vehicle)
