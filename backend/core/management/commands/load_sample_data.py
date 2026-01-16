import json
from pathlib import Path
from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware

from core.models import Team, Player, Game


BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "data"


class Command(BaseCommand):
    help = "Load sample NFL data from JSON files"

    def handle(self, *args, **options):
        self.stdout.write("Loading sample data from JSON...")

        # ---- Load Teams ----
        with open(DATA_DIR / "teams.json") as f:
            teams_data = json.load(f)

        teams = {}
        for data in teams_data:
            team, _ = Team.objects.get_or_create(
                code=data["code"],
                defaults=data,
            )
            teams[data["code"]] = team

        # ---- Load Players ----
        with open(DATA_DIR / "players.json") as f:
            players_data = json.load(f)

        for p in players_data:
            Player.objects.get_or_create(
                first_name=p["first_name"],
                last_name=p["last_name"],
                team=teams[p["team"]],
                defaults={
                    "position": p["position"],
                    "jersey_number": p.get("jersey_number"),
                },
            )

        # ---- Load Games ----
        with open(DATA_DIR / "games.json") as f:
            games_data = json.load(f)

        for g in games_data:
            Game.objects.get_or_create(
                season=g["season"],
                week=g["week"],
                home_team=teams[g["home_team"]],
                away_team=teams[g["away_team"]],
                defaults={
                    "game_date": make_aware(datetime.fromisoformat(g["game_date"])),
                    "venue": g.get("venue"),
                },
            )

        self.stdout.write(self.style.SUCCESS("Sample NFL data loaded successfully."))
