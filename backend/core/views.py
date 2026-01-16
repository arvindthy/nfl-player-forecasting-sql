from django.http import JsonResponse, HttpResponse
from django.urls import URLPattern, URLResolver, get_resolver


def add_cors_headers(request, response):
    origin = request.META.get("HTTP_ORIGIN") or "*"
    response["Access-Control-Allow-Origin"] = origin
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response


def get_api_urls():
    urls = []

    def crawl(prefix, resolver):
        for p in resolver.url_patterns:
            if isinstance(p, URLResolver):
                crawl(prefix + str(p.pattern), p)
            elif isinstance(p, URLPattern):
                path = prefix + str(p.pattern)
                path = path.replace("^", "").replace("$", "")

                if path.startswith("admin/"):
                    continue

                if not path.startswith("/"):
                    path = "/" + path
                urls.append(path)

    crawl("", get_resolver())

    cleaned = []
    for url in urls:
        url = url.replace("//", "/")
        url = url.split("(")[0]
        if not url.endswith("/"):
            url = url + "/"
        cleaned.append(url)

    return sorted(set(cleaned))


def api_url_list(request):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    response = JsonResponse({"endpoints": get_api_urls()})
    return add_cors_headers(request, response)
