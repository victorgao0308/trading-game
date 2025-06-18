from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
import uuid
from django.contrib.postgres.fields import ArrayField


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
            
    def remove_game(self, game_id):
        if game_id not in self.games:
            return -1
        
        del self.games[game_id]
        return 0
        
    def get_game(self, game_id):
        if game_id not in self.games:
            return None
        return self.games[game_id]
    

'''
Player

Player object; holds player id, player role, amount of money player, and player's owned stocks
For players owned stocks, key is stock id and value is quantity owned
3 roles:
System: who the player makes transactions with in a solo game
Player: the player
Bot: bots in the game that the player is trading against

'''
class Player(models.Model):
    ROLE_SYSTEM = 0
    ROLE_PLAYER = 1
    ROLE_BOT = 2

    ROLE_CHOICES = [
        (ROLE_SYSTEM, "System"),
        (ROLE_PLAYER, "Player"),
        (ROLE_BOT, "Bot"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.IntegerField(choices=ROLE_CHOICES, default = ROLE_SYSTEM)
    money = models.DecimalField(default=0, decimal_places=2, max_digits=20)
    owned_stocks = models.JSONField(default=dict)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.get_role_display(),
            "money": self.money,
            "owned_stocks": self.owned_stocks
        }


'''
Order

Order that a player places for a stock
Type: type or order
TYPE_SOLO: orders placed in solo mode, these get executed immediately

Status: status of order
STATUS_PLACED: order has been placed
STATUS_FILLED: order has been fulfilled
STATUS_CONFIRMED: order has been fulfilled & cannot be changed
STATUS_CANCELLED: order has been cancelled

Orders can only be cancelled by the user if they are in STATUS_PLACED status

Orders with status STATUS_PLACED or STATUS_PENDING are placed on a stock's pending_orders field. Orders stored in this field
are deleted if the game window gets reloaded. Stocks get transitioned from STATUS_PENDING to STATUS_FULFILLED in the game
tick immediately after when the order has been fulfilled and transitioned to STATUS_PENDING.


from_player: player that placed the order
timestamp: timestamp at which order was placed
quantity: amount of stocks to purchase/sell, a non-zero integer; negative values reflect selling the stock
price: in solo mode, price of stock at time of order, or in regular mode, price that user want to buy/sell at

day_placed_on: what trading day the order was placed on
day_confirmed_on: what trading day the order was confirmed on
The day_placed_on and day_confirmed_on fields help provide data for the end of trading day summary screens
'''
class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    TYPE_SOLO = 0
    TYPE_CHOICES = [
        (TYPE_SOLO, "Order in Solo Mode")
    ]

    STATUS_PLACED = 0
    STATUS_FILLED = 1
    STATUS_CONFIRMED = 2
    STATUS_CANCELLED = 3
    STATUS_CHOICES = [
        (STATUS_PLACED, "Order Placed"),
        (STATUS_FILLED, "Order Filled"),
        (STATUS_CONFIRMED, "Order Confirmed"),
        (STATUS_CANCELLED, "Order Cancelled")
    ]
    type = models.IntegerField(choices=TYPE_CHOICES, default = TYPE_SOLO)
    status = models.IntegerField(choices=STATUS_CHOICES, default = STATUS_PLACED)
    from_player = models.ForeignKey(Player, related_name="from_player", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now, editable=False)
    quantity = models.BigIntegerField()
    price = models.DecimalField(default=0, decimal_places=2, max_digits=20)
    day_placed_on = models.IntegerField(default=0)
    day_confirmed_on = models.IntegerField(default=0)


    def to_dict(self):
        return {
            "id": self.id,
            "type": self.get_type_display(),
            "status": self.get_status_display(),
            "from_player": self.from_player.to_dict(),
            "timestamp": self.timestamp,
            "quantity": self.quantity,
            "price": self.price,
            "day_placed_on": self.day_placed_on,
            "day_confirmed_on": self.day_confirmed_on
        }
    

'''
Stock

Base stock class. Keeps track of stock name, company name, and a short description of the company. Includes
current stock price, and current buy and sell orders, if applicable.

industries: contains a list of industries and sectors relevant to the current stock. This is used to
generate random events in the game.
ticks_generated: number of ticks generated for this stock
underlying_stock: name of the real-world stock that prices are derived from
first_tick_index: the index from the stock data that corresponds to the first price generated
past_values: stock values that have been generated
next_values: next stock values

pending_orders: orders that are stil pending
fulfilled_orders: order that have been fulfilled
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

    past_values = ArrayField(models.DecimalField(default=0, decimal_places=2, max_digits=20), default=list)
    next_values = ArrayField(models.DecimalField(default=0, decimal_places=2, max_digits=20), default=list)

    pending_orders = models.ManyToManyField(Order, related_name="pending_orders")
    fulfilled_orders = models.ManyToManyField(Order, related_name="fulfilled_orders")

    def to_dict(self):
        return {
            "id": self.id,
            "stock_name": self.stock_name,
            "company_name": self.company_name,
            "description": self.description,
            "current_price": self.current_price,
            "industries": self.industries,
            "ticks_generated": self.ticks_generated,
            "underlying_stock": self.underlying_stock,
            "first_tick_index": self.first_tick_index,
            "buy_orders": self.buy_orders,
            "sell_orders": self.sell_orders,
            "next_values": self.next_values,
            "past_values": self.past_values,
            "pending_orders": [order.to_dict() for order in self.pending_orders.all()],
            "fulfilled_orders": [order.to_dict() for order in self.fulfilled_orders.all()]
        }
    


# GameSettings
# Holds the type of game, as well as the game's options
# numBots and numMarketmakers are not applicable in solo modes
class GameSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    GAME_BASE_TUTORIAL = 0
    GAME_BASE_SOLO = 1
    GAME_BASE = 2
    GAME_OPTIONS_TUTORIAL = 3
    GAME_OPTIONS = 4

    GAME_CHOICES = [
        (GAME_BASE_TUTORIAL, "Tutorial for the base game"),
        (GAME_BASE_SOLO, "Base game with a single player"),
        (GAME_BASE, "Base game where player trades against bots"),
        (GAME_OPTIONS_TUTORIAL, "Tutorial for options mode"),
        (GAME_OPTIONS, "Game where player can trade options with bots")
    ]

    game_type = models.IntegerField(choices=GAME_CHOICES, default = GAME_BASE_SOLO)
    num_bots = models.IntegerField(default=30)
    num_market_makers = models.IntegerField(default=3)
    num_trading_days = models.IntegerField(default=10)
    num_ticks_per_day = models.IntegerField(default=20)
    time_between_ticks = models.FloatField(default=1.5)
    starting_cash = models.IntegerField(default=1000)
    volatility = models.IntegerField(default=10)
    seed = models.TextField(default="")


    def to_dict(self):
        return {
            "id": self.id,
            "game_type": self.get_game_type_display(),
            "num_bots": self.num_bots,
            "num_market_makers": self.num_market_makers,
            "num_trading_days": self.num_trading_days,
            "num_ticks_per_day": self.num_ticks_per_day,
            "time_between_ticks": self.time_between_ticks,
            "starting_cash": self.starting_cash,
            "volatility": self.volatility,
            "seed": self.seed
        }


'''
BaseGame
Base game that includes one stock option

'''
class BaseGame(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    num_players = models.BigIntegerField(default=0)
    players = models.ManyToManyField(Player, related_name="players")
    seed = models.CharField(max_length=256, default="")
    stock = models.ForeignKey(Stock, related_name="games", on_delete=models.CASCADE)
    time_to_next_tick = models.FloatField(default=-1)
    is_paused = models.BooleanField(default=True)
    settings = models.ForeignKey(GameSettings, related_name="settings",  on_delete=models.CASCADE, default=None)



    def to_dict(self):
        return {
            "type": "base_game",
            "id": self.id,
            "created_at": self.created_at,
            "num_players": self.num_players,
            "players": [player.to_dict() for player in self.players.all()],
            "seed": self.seed,
            "stock": self.stock.to_dict(),
            "time_to_next_tick": self.time_to_next_tick,
            "is_paused": self.is_paused,
            "settings": self.settings.to_dict()
        }