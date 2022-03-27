from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Segment(models.Model):
    segment_name = models.CharField(max_length=100)

    # モデルをインスタンス化した際に、インスタンスに対してprintなどを
    # 実行した際に文字列（ここではsegmant_name）を返す特殊なメソッド
    def __str__(self):
        return self.segment_name

class Brand(models.Model):
    brand_name = models.CharField(max_length=100)

    def __str__(self):
        return self.brand_name

class Vehicle(models.Model):
    user = models.ForeignKey(
        User,
        # 紐付いたUserオブジェクト削除時にはこちらも削除される
        on_delete=models.CASCADE
    )
    vehicle_name = models.CharField(max_length=100)
    release_year = models.IntegerField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    # max_digits => 小数点以下含めた最大桁数 この場合は、「9999.99」となる
    # decimal_places => 小数点以下何位までかの設定

    segment = models.ForeignKey(
        Segment,
        # 紐付いたSegmentオブジェクト削除時にはこちらも削除される
        on_delete=models.CASCADE
    )
    brand = models.ForeignKey(
        Brand,
        # 紐付いたSegmentオブジェクト削除時にはこちらも削除される
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.vehicle_name
