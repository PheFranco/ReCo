from django.urls import path
from . import views

app_name = 'web'

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('marketplace/', views.marketplace, name='marketplace'),
    # Allow legacy/static-like requests to /marketplace/index.html to reach the same view
    path('marketplace/index.html', views.marketplace, name='marketplace_index_html'),
    # Convenient routes for converted archive pages
    path('app/', views.app_page, name='app'),
    path('main/', views.main_page, name='main'),
    path('archive/auth/', views.login_archive, name='archive_auth'),
    path('archive/register/', views.register_archive, name='archive_register'),
    path('archive/profile/', views.profile_archive, name='archive_profile'),
    path('archive/marketplace/', views.marketplace_archive, name='archive_marketplace'),
    # Generic archive route (fallback) must be after specific archive routes
    path('archive/<str:name>/', views.archive_view, name='archive'),
    # API endpoints
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/items/', views.api_items, name='api_items'),
    path('api/profile/', views.api_profile, name='api_profile'),
    path('api/items/delete/', views.api_items_delete, name='api_items_delete'),
]
