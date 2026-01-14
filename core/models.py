from django.db import models


class Team(models.Model):
    CONFERENCE_CHOICES = [
        ("AFC", "AFC"),
        ("NFC", "NFC"), 
		
    ]

    DIVISION_CHOICES = [
        ("East", "East"),
        ("West", "West"),
        ("North", "North"),
        ("South", "South"),
    ]

    code = models.CharField(
        max_length=5,
        unique=True,
        help_text="Short team code (e.g. SF, DAL)",
    )

    name = models.CharField(
        max_length=100,
        help_text="Full team name",
    )
    
    description = models.CharField(
        max_length=400,
		null=True,
        help_text="Team Description",
    )

    city = models.CharField(
        max_length=100,
    )

    conference = models.CharField(
        max_length=3,
        choices=CONFERENCE_CHOICES,
    )

    division = models.CharField(
        max_length=10,
        choices=DIVISION_CHOICES,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["conference", "division", "name"]
        verbose_name = "Team"
        verbose_name_plural = "Teams"

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"

class Player(models.Model):
    POSITION_CHOICES = [
        ("QB", "Quarterback"),
        ("RB", "Running Back"),
        ("WR", "Wide Receiver"),
        ("TE", "Tight End"),
    ]

    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100
    )

    position = models.CharField(
        max_length=2,
        choices=POSITION_CHOICES
    )

    team = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
        related_name="players"
    )

    jersey_number = models.PositiveSmallIntegerField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        ordering = ["team__name", "position", "last_name", "first_name"]
        verbose_name = "Player"
        verbose_name_plural = "Players"

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.position})"

class Game(models.Model):
    season = models.PositiveSmallIntegerField(
        help_text="NFL season year (e.g. 2025)"
    )

    week = models.PositiveSmallIntegerField(
        help_text="Week number within the season"
    )

    game_date = models.DateTimeField(
        help_text="Scheduled kickoff date and time"
    )

    home_team = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
        related_name="home_games"
    )

    away_team = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
        related_name="away_games"
    )

    venue = models.CharField(
        max_length=200,
        null=True,
        blank=True
    )

    is_played = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = ["season", "week", "game_date"]
        verbose_name = "Game"
        verbose_name_plural = "Games"
        constraints = [
            models.UniqueConstraint(
                fields=["season", "week", "home_team", "away_team"],
                name="unique_game_per_week"
            )
        ]

    def __str__(self) -> str:
        return f"Week {self.week}: {self.away_team.code} @ {self.home_team.code}"
