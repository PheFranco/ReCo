from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, Http404
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage
from django.contrib.auth.decorators import login_required
import os
import json

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'data')
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)

ITEMS_FILE = os.path.join(DATA_DIR, 'items.json')

def _load_json(path, default):
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            return json.load(fh)
    except Exception:
        return default

def _save_json(path, data):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.models import User


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


from django.http import Http404
from django.template import TemplateDoesNotExist


def archive_view(request, name):
    """Renderiza templates gerados a partir de `archive_tsx/`.

    Exemplo: /archive/App/ -> renderiza `archive_tsx/App.html`.
    """
    # ensure CSRF cookie for JS-driven pages
    from django.middleware.csrf import get_token
    get_token(request)
    template_name = f'archive_tsx/{name}.html'
    try:
        return render(request, template_name)
    except TemplateDoesNotExist:
        raise Http404("Template not found")


def app_page(request):
    ctx = { 'is_logged_in': request.session.get('is_logged_in', False) }
    return render(request, 'archive_tsx/App.html', ctx)


def main_page(request):
    ctx = { 'is_logged_in': request.session.get('is_logged_in', False) }
    return render(request, 'archive_tsx/main.html', ctx)


def login_archive(request):
    from django.middleware.csrf import get_token
    get_token(request)
    ctx = { 'is_logged_in': request.session.get('is_logged_in', False) }
    # render cleaned page template
    return render(request, 'pages/auth.html', ctx)


def register_archive(request):
    from django.middleware.csrf import get_token
    get_token(request)
    ctx = { 'is_logged_in': request.session.get('is_logged_in', False) }
    return render(request, 'pages/register.html', ctx)


def profile_archive(request):
    from django.middleware.csrf import get_token
    get_token(request)
    ctx = { 'is_logged_in': request.session.get('is_logged_in', False), 'user_name': request.session.get('user_name', 'Usuário') }
    return render(request, 'pages/profile.html', ctx)


def marketplace_archive(request):
    from django.middleware.csrf import get_token
    get_token(request)
    ctx = { 'is_logged_in': request.session.get('is_logged_in', False) }
    return render(request, 'pages/marketplace.html', ctx)


def api_register(request):
    """Registra usuário usando o modelo Django `User` e faz login."""
    if request.method != 'POST':
        return JsonResponse({'error': 'use POST'}, status=405)

    username = request.POST.get('email') or request.POST.get('username')
    password = request.POST.get('password')
    name = request.POST.get('name') or ''
    if not username or not password:
        return JsonResponse({'error': 'email and password required'}, status=400)

    UserModel = get_user_model()
    if UserModel.objects.filter(username=username).exists():
        return JsonResponse({'error': 'user_exists'}, status=400)

    user = UserModel.objects.create_user(username=username, email=username, password=password, first_name=name)
    user.save()

    # login
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'ok': True, 'user_id': user.id})

    return JsonResponse({'error': 'could_not_login'}, status=500)


def api_login(request):
    """Autentica usuário usando django.contrib.auth.authenticate e faz login."""
    if request.method != 'POST':
        return JsonResponse({'error': 'use POST'}, status=405)

    username = request.POST.get('email') or request.POST.get('username')
    password = request.POST.get('password')
    if not username or not password:
        return JsonResponse({'error': 'email and password required'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'ok': True, 'user_id': user.id})

    return JsonResponse({'error': 'invalid_credentials'}, status=401)


def api_items(request):
    """GET: lista items (com paginação e filtros), POST: cria item (fields: title, description, category, location)."""
    from .models import Item
    if request.method == 'GET':
        # filters
        items_qs = Item.objects.all().order_by('-created_at')
        category = request.GET.get('category')
        q = request.GET.get('q')
        if category:
            items_qs = items_qs.filter(category__iexact=category)
        if q:
            items_qs = items_qs.filter(Q(title__icontains=q) | Q(description__icontains=q))

        # pagination
        try:
            page = int(request.GET.get('page', '1'))
        except ValueError:
            page = 1
        try:
            per_page = int(request.GET.get('per_page', '10'))
        except ValueError:
            per_page = 10

        paginator = Paginator(items_qs, per_page)
        try:
            page_obj = paginator.page(page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages) if paginator.num_pages else []

        items = []
        for it in (page_obj.object_list if hasattr(page_obj, 'object_list') else page_obj):
            items.append({
                'id': f'item-{it.id}',
                'title': it.title,
                'description': it.description,
                'category': it.category,
                'location': it.location,
                'user_id': str(it.user.id) if it.user else 'anon',
                'user_name': it.user.get_full_name() or it.user.username if it.user else 'Anônimo',
                'photo_url': it.photo.url if it.photo else '',
                'status': it.status,
                'created_at': it.created_at.isoformat(),
            })

        return JsonResponse({
            'results': items,
            'page': page,
            'per_page': per_page,
            'total_pages': paginator.num_pages,
            'total_items': paginator.count,
        })

    if request.method == 'POST':
        # require authentication to create items
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'authentication_required'}, status=401)

        title = request.POST.get('title')
        description = request.POST.get('description')
        category = request.POST.get('category') or 'Outros'
        location = request.POST.get('location') or ''
        if not title or not description:
            return JsonResponse({'error': 'title and description required'}, status=400)

        photo = request.FILES.get('photo')
        itm = Item.objects.create(
            title=title,
            description=description,
            category=category,
            location=location,
            user=request.user,
        )
        if photo:
            itm.photo.save(photo.name, photo, save=True)
        itm.save()
        item = {
            'id': f'item-{itm.id}',
            'title': itm.title,
            'description': itm.description,
            'category': itm.category,
            'location': itm.location,
            'user_id': str(itm.user.id) if itm.user else 'anon',
            'user_name': itm.user.get_full_name() or itm.user.username if itm.user else 'Anônimo',
            'photo_url': itm.photo.url if itm.photo else '',
            'status': itm.status,
            'created_at': itm.created_at.isoformat(),
        }
        return JsonResponse({'ok': True, 'item': item})

    return JsonResponse({'error': 'method not allowed'}, status=405)


def api_profile(request):
    """Retorna dados do usuário autenticado."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'authentication_required'}, status=401)
    user = request.user
    return JsonResponse({
        'user': {
            'id': user.id,
            'username': user.username,
            'name': user.get_full_name(),
            'email': user.email,
            'is_staff': user.is_staff,
        }
    })


def api_items_delete(request):
    """Exclui item por id (POST with form field 'id')."""
    if request.method != 'POST':
        return JsonResponse({'error': 'use POST'}, status=405)
    # require authentication to delete
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'authentication_required'}, status=401)

    item_id = request.POST.get('id')
    if not item_id:
        return JsonResponse({'error': 'id required'}, status=400)
    # attempt to delete model item
    from .models import Item
    try:
        # incoming id might be like 'item-12'
        if item_id.startswith('item-'):
            pk = int(item_id.split('-', 1)[1])
        else:
            pk = int(item_id)
        itm = Item.objects.get(pk=pk)
        # only owner or staff can delete
        if itm.user and itm.user != request.user and not request.user.is_staff:
            return JsonResponse({'error': 'forbidden'}, status=403)
        itm.delete()
        return JsonResponse({'ok': True})
    except Item.DoesNotExist:
        return JsonResponse({'error': 'not_found'}, status=404)
