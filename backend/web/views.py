from django.shortcuts import render


def index(request):
    return render(request, 'index.html')


def login_view(request):
    return render(request, 'login.html')


def register(request):
    return render(request, 'register.html')


def profile(request):
    # profile reads query params client-side; we just render template
    return render(request, 'profile.html')


def marketplace(request):
    return render(request, 'marketplace.html')
