from django.contrib import admin
from .models import Team
from .models import Player, Game
# Register your models here.

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "city",
        "conference",
        "division",
        "is_active",
    )

    list_filter = (
        "conference",
        "division",
        "is_active",
    )

    search_fields = (
        "code",
        "name",
        "city",
    )

    ordering = ("conference", "division", "name")

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "position",
        "team",
        "jersey_number",
        "is_active",
    )

    list_filter = (
        "position",
        "team",
        "is_active",
    )

    search_fields = (
        "first_name",
        "last_name",
    )

    ordering = (
        "team__name",
        "position",
        "last_name",
        "first_name",
    )

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = (
        "season",
        "week",
        "away_team",
        "home_team",
        "game_date",
        "is_played",
    )

    list_filter = (
        "season",
        "week",
        "is_played",
        "home_team",
        "away_team",
    )

    search_fields = (
        "home_team__name",
        "away_team__name",
        "venue",
    )

    ordering = (
        "season",
        "week",
        "game_date",
    )

    date_hierarchy = "game_date"
