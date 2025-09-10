from django.contrib import admin
from .models import Customer, JuiceProduct, Order, OrderItem




# La permision seul au super utilisateur accede a la page admin
# class SuperuserAdminSite(admin.AdminSite):
#     def has_permission(self, request):
#         return request.user.is_active and request.user.is_superuser


# admin_site = SuperuserAdminSite(name="superadmin")

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("user", "telephone", "adresse")
    search_fields = ("user__username", "telephone")
    list_filter = ("user__is_active",)



@admin.register(JuiceProduct)
class JuiceProductAdmin(admin.ModelAdmin):
    list_display = ("name", "categorie", "price", "stock", "update_date","image")
    list_filter = ("categorie", "update_date")
    search_fields = ("name", "description")
    ordering = ("-update_date",)
    list_editable = ("price", "stock")


class OrderItemInline(admin.TabularInline):  # ou StackedInline si tu préfères
    model = OrderItem
    extra = 1
    readonly_fields = ("sous_total",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "date_commande", "statut", "total")
    list_filter = ("statut", "date_commande")
    search_fields = ("id",)
    ordering = ("-date_commande",)
    inlines = [OrderItemInline]

    def get_queryset(self, request):

        qs = super().get_queryset(request)

        if request.user.is_superuser:
            return qs
        return qs.filter(user = request.user )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "sous_total")
    list_filter = ("product",)
    search_fields = ("order__id", "product__name")
