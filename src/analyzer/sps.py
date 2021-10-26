"""
Surcouche de communication interne SPS
"""

import requests
import urllib.parse
from django.conf import settings

def mk_url(path):
    return urllib.parse.urljoin(
        settings.SPS_API_URL_BASE,
        path
    )

def fetch_toc(case_id):
    """
    Récupère la table des contenus de SPS.
    """
    
    response = requests.get(mk_url(f"/affaires/{case_id}/pieces"))
    response.raise_for_status()
    return response.json()

def fetch_piece(url):
    """
    Récupère une pièce d'une affaire de SPS.
    La connexion est ouverte en streaming pour permettre
    le contrôle sur le téléchargement du contenu.
    """

    response = requests.get(mk_url(url), stream=True)
    response.raise_for_status()
    return response
