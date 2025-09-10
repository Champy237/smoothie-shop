import os
import django
import requests
from django.core.files.base import ContentFile
import sys

# Permet de trouver le projet depuis ce fichier
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "juice_project.settings")
django.setup()

from app_juice.models import JuiceProduct

products = [
    {"name": "Jus d'Orange Frais", "description": "Un jus 100% naturel, pressé à partir d'oranges fraîches.", "price": 3.50, "categorie": "classic", "stock": 50, "image": "produits/Screenshot_from_2025-08-30_04-24-57.png"},
    # {"name": "Jus de Pomme", "description": "Un jus doux et fruité de pommes sélectionnées.", "price": 3.00, "categorie": "classic", "stock": 40, "image": "https://images.unsplash.com/photo-1571689934267-918f94d2e40d?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus de Raisin Rouge", "description": "Rafraîchissant et naturel, issu de raisins rouges bio.", "price": 3.80, "categorie": "classic", "stock": 35, "image": "https://images.unsplash.com/photo-1600180758892-54f2d1c5bb7c?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus de Passion Exotique", "description": "Saveur exotique de fruits de la passion pour un goût unique.", "price": 4.00, "categorie": "exotic", "stock": 30, "image": "https://images.unsplash.com/photo-1563805042-7684e4b0db5d?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus d'Ananas", "description": "Un jus tropical, sucré et acidulé à la fois.", "price": 4.20, "categorie": "exotic", "stock": 25, "image": "https://images.unsplash.com/photo-1574226516831-e1dff420e12d?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Smoothie Fraise Banane", "description": "Délicieux smoothie à base de fraises et bananes fraîches.", "price": 4.50, "categorie": "smoothies", "stock": 35, "image": "https://images.unsplash.com/photo-1587049352847-86d948fe63d2?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Smoothie Mangue Passion", "description": "Smoothie doux et tropical avec mangue et fruit de la passion.", "price": 4.80, "categorie": "smoothies", "stock": 30, "image": "https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus Détox Vert", "description": "Mélange sain de concombre, épinard et pomme pour un boost naturel.", "price": 5.00, "categorie": "smoothies", "stock": 20, "image": "https://images.unsplash.com/photo-1589927986089-35812389fc52?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus de Carotte", "description": "Un jus riche en vitamine A, doux et naturel.", "price": 3.50, "categorie": "classic", "stock": 40, "image": "https://images.unsplash.com/photo-1598514982952-74aee48ce085?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus de Citron Gingembre", "description": "Un jus acidulé avec un petit piquant de gingembre.", "price": 4.00, "categorie": "exotic", "stock": 25, "image": "https://images.unsplash.com/photo-1582719478250-718f37f6aa2e?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Smoothie Framboise Myrtille", "description": "Smoothie riche en antioxydants avec framboises et myrtilles.", "price": 4.90, "categorie": "smoothies", "stock": 30, "image": "https://images.unsplash.com/photo-1596495577886-d1cb1c5d72e2?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus de Pêche", "description": "Un jus doux et sucré, parfait pour l'été.", "price": 3.80, "categorie": "classic", "stock": 35, "image": "https://images.unsplash.com/photo-1589395595558-0aaf808e67bb?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus Tropical Exotique", "description": "Mélange d'ananas, mangue et fruit de la passion.", "price": 4.50, "categorie": "exotic", "stock": 25, "image": "https://images.unsplash.com/photo-1590080878529-6d04884d2061?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Smoothie Banane Kiwi", "description": "Smoothie frais et vitaminé à base de banane et kiwi.", "price": 4.70, "categorie": "smoothies", "stock": 30, "image": "https://images.unsplash.com/photo-1571047399553-0c4ff6f1654e?auto=format&fit=crop&w=500&q=60"},
    # {"name": "Jus Fraise Menthe", "description": "Jus rafraîchissant avec fraises et une touche de menthe.", "price": 4.20, "categorie": "classic", "stock": 30, "image": "https://images.unsplash.com/photo-1607756490641-d1cb1c5d72e2?auto=format&fit=crop&w=500&q=60"}
]


def populate():
    for product in products:
        p, created = JuiceProduct.objects.get_or_create(
            name=product["name"],
            defaults={
                "description": product["description"],
                "price": product["price"],
                "categorie": product["categorie"],
                "stock": product["stock"]
            }
        )

        # Télécharger et sauvegarder l'image si possible
        image_url = product.get("image")
        if image_url:
            try:
                response = requests.get(image_url)
                response.raise_for_status()  # Vérifie que le téléchargement est OK
                filename = f"{p.name.replace(' ', '_').lower()}.jpg"
                p.image.save(filename, ContentFile(response.content), save=True)
                print(f"Produit ajouté avec image : {p.name}")
            except Exception as e:
                print(f"Impossible de télécharger l'image pour {p.name}. Produit ajouté sans image. Erreur : {e}")
                p.save()
        else:
            print(f"Aucune image pour {p.name}. Produit ajouté sans image.")
            p.save()

if __name__ == "__main__":
    populate()
