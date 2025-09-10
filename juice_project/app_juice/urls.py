from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from .views  import *


urlpatterns = [


    # les pages princpale 

    path("",index,name="index"),
    
    path("catalog/",all_catalog,name = "catalog"),

    path("catalog_classic/",classiquees_catalog,name="catalog_classique"),

    path("catalog_exotic/",exotic_catalog,name ="catalog_exotic"),

    path("catalog_smoothies/",smoothies_catalog,name="smoothies"),

    path('cart/remove/<int:product_id>/', remove_from_cart, name='remove_from_cart'),  # Supprimer un produit

    path('cart/update/<int:product_id>/', update_cart, name='update_cart'),           # Mettre à jour la quantité

    path('add-to-cart/<int:product_id>/', add_to_cart, name='add_to_cart'),

    path("contact/",contact,name="contact"),

    path("juice_detail/<int:juice_id>/",detail,name = "detail_juice"),

    path('create_order/', create_order, name='create_order'),

    # url de la page connexion, deconnexion et registration

    path('login/',auth_views.LoginView.as_view(template_name = 'login_registration/login.html'),name='login'),

    path('logout/',auth_views.LogoutView.as_view(next_page ='index'),name ='logout'),

    path("registration/",registration,name="registration"),

    #url gestion de la page admin 

    path("index_admin/",admin_index,name="index_admin"),


    path("product_admin/",admin_product,name="product_admin"),

    

]