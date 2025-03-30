from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import uuid



'''
GameManager

Keeps track of current active games, GameManager is not stored in the database; instead, it acts as global manager
to keep track of the games that are currently running

Uses singleton pattern; calling GameManager() only creates a new instance if it doesn't exist, returns current instance
if one already exists
'''
class GameManager():
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls, *args, **kwargs)

            # dictionary of current games
            # key: game id
            # value: game model
            cls._instance.games = {}
        return cls._instance

    def register_game(self, game_id):
        if game_id in self.games:
            return -1
        else:
            try:
                game = BaseGame.objects.get(id=game_id)
                self.games[game_id] = game
                return 0
            except ObjectDoesNotExist:
                return -2
        
    def get_game(self, game_id):
        if game_id not in self.games:
            return f"ERORR: game with id {game_id} not registered yet"
        return self.games[game_id]
    

    def update_game_state(self, game_id):
        try:
            game = BaseGame.objects.get(id=game_id)
            
        except ObjectDoesNotExist:
            return f"ERORR: game with id {game_id} does not exist"
        
        self.games[game_id] = game  
        return f"SUCCESS: game with id {game_id} updated"
    

    def __str__(self):
        return f""
'''
BaseGame
Base game that includes one stock option
'''
class BaseGame(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    num_players = models.BigIntegerField(default=1)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.request_queue = []


    def to_dict(self):
        return {
            "type": "base_game",
            "id": self.id,
            "created_at": self.created_at,
            "num_players": self.num_players,
            "request_queue": self.request_queue,
        }

    

'''
Stock
'''
class Stock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=256, default="Stock XYZ")
    description = models.TextField(default="Default stock description")
    currentPrice = models.FloatField(default=0)


    buyOrders = models.JSONField()
    sellOrders = models.JSONField()



'''
Player


'''
class Player(models.Model):
    ROLE_CHOICES = [
        (0, "Player"),
        (1, "Bot"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.IntegerField(choices=ROLE_CHOICES)
    money = models.FloatField()

