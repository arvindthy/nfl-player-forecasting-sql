from django.http import JsonResponse
from .services.queries import fetch_overview

def overview_view(request):
    data = fetch_overview()
    return JsonResponse(data)
