from django.db import models

class baseGame(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    num_players = models.BigIntegerField(default=1)


class players(models.Model):
    ROLE_CHOICES = [
        (0, "Player"),
        (1, "Bot"),
    ]
    id = models.AutoField(primary_key=True)
    role = models.IntegerField(choices=ROLE_CHOICES)
    money = models.FloatField()




