"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views.game import create_base_game, delete_base_game, get_game_manager, register_base_game, get_next_base_game_price_solo
from .views.game import create_tutorial, pause_base_game, resume_base_game, remove_game_from_manager
from .views.stock import create_base_order, remove_pending_orders, get_orders_placed_on_day

urlpatterns = [
    path("admin/", admin.site.urls),
    path('create-base-game/', create_base_game, name='create-base-game'),
    path('delete-base-game/<str:game_id>/', delete_base_game, name='delete-base-game'),
    path('get-game-manager/', get_game_manager, name='get-game-manager'),
    path('register-base-game/<str:game_id>/', register_base_game, name='register-base-game'),
    path('get-next-base-game-price-solo/<str:game_id>/', get_next_base_game_price_solo, name='get-next-base-game-price-solo'),
    path('create-tutorial/', create_tutorial, name='create-tutorial'),
    path('pause-base-game/<str:game_id>/', pause_base_game, name='pause-base-game'),
    path('resume-base-game/<str:game_id>/', resume_base_game, name="resume-base-game"),
    path('remove-game-from-manager/<str:game_id>/', remove_game_from_manager, name='remove-game-from-manager'),
    path('create-base-order/', create_base_order, name='create-base-order'),
    path('remove-pending-orders/<str:stock_id>/', remove_pending_orders, name='remove-pending-orders'),
    path('get-orders-placed-on-day/', get_orders_placed_on_day, name='get-orders-placed-on-day')
    ]

