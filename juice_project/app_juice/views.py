from django.shortcuts import render,redirect,get_object_or_404
from django.contrib import messages
from .models import *
from .forms import *
from django.contrib.auth.decorators import login_required # authorisation uniquement pas une connexion
from django.http import HttpResponseForbidden, JsonResponse
# Create your views here.

# page accueil 

def index(request):

    juices = JuiceProduct.objects.all()[:5]
    
    return render(request,"app_juice/index.html", { 'juices': juices })


# gestion des  pages catalog

def all_catalog(request):

    juice = JuiceProduct.objects.all()

    return render(request,"app_juice/catalog_list/all_catalog.html",{'juices':juice})



def classiquees_catalog(request):

    juice = JuiceProduct.objects.all()

    return render(request,"app_juice/catalog_list/classiques_catalog.html",{'juices':juice})



def exotic_catalog(request):

    juice = JuiceProduct.objects.all()

    return render(request,"app_juice/catalog_list/exotic_catalog.html",{'juices':juice})



def smoothies_catalog(request):

    juice = JuiceProduct.objects.all()

    return render(request,"app_juice/catalog_list/smoothies_catalog.html",{'juices':juice})


#gestion de la page contact

def contact(request):

    return render(request,"app_juice/contact.html")


# gestion de page detail

def detail(request,juice_id):

    juice =  get_object_or_404(JuiceProduct,pk = juice_id)
    juice_items = JuiceProduct.objects.all()[:3]
    context = {
        "juice":juice,
        "juice_items":juice_items
    }

    return render(request,"app_juice/detaile.html",context)



# Ajouter un produit au panier
def add_to_cart(request, product_id):
    product = get_object_or_404(JuiceProduct, id=int(product_id))
    cart = request.session.get('cart', {})

    if str(product_id) in cart:
        cart[str(product_id)]['quantity'] += 1
    else:
        cart[str(product_id)] = {
            'name': product.name,
            'price': float(product.price),
            'quantity': 1,
            'image': product.image.url
        }

    request.session['cart'] = cart

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        total_items = sum(item['quantity'] for item in cart.values())
        return JsonResponse({'total_items': total_items})

    return redirect('catalog')


# Supprimer un produit du panier
def remove_from_cart(request, product_id):
    cart = request.session.get('cart', {})

    if str(product_id) in cart:
        del cart[str(product_id)]
        request.session['cart'] = cart
        messages.success(request, "Produit supprimé du panier.")
    else:
        messages.error(request, "Le produit n'était pas dans le panier.")

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        total_items = sum(item['quantity'] for item in cart.values())
        return JsonResponse({'total_items': total_items})

    return redirect('create_order')

# Mettre à jour la quantité dans le panier
def update_cart(request, product_id):
    if request.method == 'POST':
        cart = request.session.get('cart', {})
        quantity = request.POST.get('quantity')

        if quantity:
            try:
                quantity = int(quantity)
                if quantity > 0:
                    if str(product_id) in cart:
                        cart[str(product_id)]['quantity'] = quantity
                        messages.success(request, "Quantité mise à jour.")
                    else:
                        messages.error(request, "Produit non trouvé dans le panier.")
                else:
                    if str(product_id) in cart:
                        del cart[str(product_id)]
                        messages.success(request, "Produit supprimé du panier.")
            except ValueError:
                messages.error(request, "Quantité invalide.")

            request.session['cart'] = cart

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            total_items = sum(item['quantity'] for item in cart.values())
            return JsonResponse({'total_items': total_items})

    return redirect('create_order')

# Afficher le panier / créer la commande

@login_required
def create_order(request):
    cart = request.session.get('cart', {})
    if not cart:
        messages.error(request, "Votre panier est vide.")
        return redirect('catalog')

    try:
        customer = Customer.objects.get(user=request.user)
    except Customer.DoesNotExist:
        messages.error(request, "Vous n'avez pas de profil client.")
        return redirect('catalog')

    # Créer la commande
    order = Order.objects.create(customer=customer, total=0)

    total = 0
    for product_id, item in cart.items():
        product = get_object_or_404(JuiceProduct, id=int(product_id))
        quantity = item['quantity']
        sous_total = product.price * quantity
        total += sous_total

        OrderItem.objects.create(order=order, product=product, quantity=quantity)

    order.total = total
    order.save()

    # Vider le panier
    request.session['cart'] = {}

    messages.success(request, "Commande passée avec succès !")

    # Afficher la page create_order avec les détails de la commande
    context = {
        'cart_items': order.items.all(),
        'total': order.total
    }
    return render(request, 'app_juice/order_detail.html', context)



#gestion de la page inscription

def registration(request):
    if request.method == "POST":
        form = CustomerRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Votre compte a été créé avec succès !")
            return redirect("login")  # à adapter selon ton projet
    else:
        form = CustomerRegistrationForm()

    return render(request, "login_registration/registration.html", {"form": form})


# gesion de la page administrateur 




@login_required
def admin_index(request):
    if not request.user.is_superuser:
        return HttpResponseForbidden("Accès refusé")
    return render(request, "admin/dashboard.html")


@login_required
def admin_product(request):
    if not request.user.is_superuser:
        return HttpResponseForbidden("Accès refusé")
    
    juice = JuiceProduct.objects.all()
    return render(request, "admin/product.html", {'juices': juice})