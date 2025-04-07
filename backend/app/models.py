from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import uuid
from django.contrib.postgres.fields import ArrayField


'''
GameManager

NOT UTILIZED

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
            return None
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
Stock

Base stock class. Keeps track of stock name, company name, and a short description of the company. Includes
current stock price, and current buy and sell orders, if applicable.

industries: contains a list of industries and sectors relevant to the current stock. This is used to
generate random events in the game.
ticks_generated: number of ticks generated for this stock
underlying_stock: name of the real-world stock that prices are derived from
first_tick_index: the index from the stock data that corresponds to the first price generated
'''
class Stock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stock_name = models.CharField(max_length=256, default="Stock XYZ")
    company_name = models.CharField(max_length=256, default="Company XYZ")
    description = models.TextField(default="Default stock description")
    current_price = models.DecimalField(default=0, decimal_places=2, max_digits=20)
    industries = ArrayField(models.CharField(max_length=256), blank=True, default=list)

    ticks_generated = models.BigIntegerField(default=0)
    underlying_stock = models.CharField(max_length=256, default="")
    first_tick_index = models.BigIntegerField(default=-1)

    buy_orders = models.JSONField(default=dict)
    sell_orders = models.JSONField(default=dict)


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # values calculated in advance will be stored in this array
        self.next_values = []


    def to_dict(self):
        return {
            "id": self.id,
            "stock_name": self.stock_name,
            "company_name": self.company_name,
            "description": self.description,
            "current_price": self.current_price,
            "industries": self.industries,
            "buy_orders": self.buy_orders,
            "sell_orders": self.sell_orders
        }

'''
BaseGame
Base game that includes one stock option

'''
class BaseGame(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    num_players = models.BigIntegerField(default=1)
    seed = models.CharField(max_length=256, default="")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="games")
    time_to_next_tick = models.FloatField(default=-1)
    is_paused = models.BooleanField(default=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.request_queue = []

    def to_dict(self):
        return {
            "type": "base_game",
            "id": self.id,
            "created_at": self.created_at,
            "num_players": self.num_players,
            "seed": self.seed,
            "request_queue": self.request_queue,
            "stock": self.stock.to_dict(),
            "time_to_next_tick": self.time_to_next_tick,
            "is_paused": self.is_paused
        }


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
    money = models.DecimalField(default=0, decimal_places=2, max_digits=20)