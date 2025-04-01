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

urlpatterns = [
    path("admin/", admin.site.urls),
    path('create-base-game/', create_base_game, name='create-base-game'),
    path('delete-base-game/<str:game_id>/', delete_base_game, name='delete-base-game'),
    path('get-game-manager/', get_game_manager, name='get-game-manager'),
    path('register-base-game/<str:game_id>/', register_base_game, name='register-base-game'),
    path('get-next-base-game-price-solo/<str:game_id>/', get_next_base_game_price_solo, name='get-next-base-game-price-solo')
    ]

