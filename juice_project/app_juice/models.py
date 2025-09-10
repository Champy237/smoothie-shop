from django.db import models
from django.contrib.auth.models import User

# Customer management
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)

    def __str__(self):
        return self.user.username


# Product management
class JuiceProduct(models.Model):
    STATUS = [
        ("classic", "Classique"),
        ("exotic", "Exotique"),
        ("smoothies", "Smoothies"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=9, decimal_places=2)
    categorie = models.CharField(max_length=50, choices=STATUS)
    image = models.ImageField(upload_to="produits/")
    stock = models.IntegerField(default=0)
    update_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


#Order management
class Order(models.Model):
    STATUTS = [
        ("pending", "En attente"),
        ("paid", "Payé"),
        ("shipped", "Expédié"),
        ("delivered", "Livré"),
    ]
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="orders",null=True)
    date_commande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default="pending")
    total = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Commande {self.id} - {self.customer.user.username}"

    def calculate_total(self):
        self.total = sum(item.sous_total for item in self.items.all())
        self.save()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items" )
    product = models.ForeignKey(JuiceProduct, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def sous_total(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
