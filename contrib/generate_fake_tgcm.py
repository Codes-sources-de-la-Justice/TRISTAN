#!/usr/bin/env python3
from faker import Faker
from datetime import timezone
from uuid import uuid4
import random
import json
import argparse
import sys

fake = Faker('fr_FR')

def read_natinfs(json_filename):
    with open(json_filename, 'r') as f:
        return json.load(f)

natinfs = read_natinfs('../../../data/natinfs.json')

def gen_date():
    date = fake.date_time()
    return {
        '#utc': f'{date.astimezone(timezone.utc).isoformat(timespec="seconds")}Z[UTC]',
        '#text': date.strftime('%d/%M/%Y à %HH:%MM')
    }

def generate_basic(i):
    profile = fake.profile()
    *nom, prenom = profile['name'].split(' ')
    nom = ' '.join(nom)
    return {
        'Nom': nom,
        'Prenom': prenom,
        'Profession': { '#text': profile['job'] },
        'Adresse': profile['address'],
        'Naissance_Date': profile['birthdate'].strftime('%d/%M/%Y'),
        'Naissance_Lieu': fake.city(),
        'Commune_Residence': fake.city(),
        'CP_Commune_Residence': fake.postcode(),
        'CP_Commune_Naissance': fake.postcode(),
        'Nationalite': 'Française',
        'Nom_Mere': nom,
        'Situation_Familiale': 'Célibataire',
        'Curatelle': fake.boolean(),
        'Tutelle': fake.boolean(),
        'Interprete': fake.boolean(),
        'Personne_Id': i,
        'Global_Id': str(uuid4())
    }

def generate_fact_implication(facts, implication):
    return {
        'Implications': {
            'Faits': [
                { 'Id_Fait': fact['Id_Fait'], 'Global_Id': fact['Global_Id'], 'Implication': implication }
                for fact in facts
            ]
        }
    }


def generate_mec(facts):
    return generate_fact_implication(facts, 'MEC')
    
def generate_vic(facts):
    return generate_fact_implication(facts, 'VIC')

def generate_tem(facts):
    return {}

def generate_fact(i):
    natinf = fake.random_sample(elements=natinfs.keys(), length=1)[0]
    gps_x, gps_y = fake.local_latlng(country_code='FR', coords_only=True)
    return {
        'Nom_Region': 'Ile-de-France',
        'Nature_Lieu': { '#text': 'HABITATION INDIVIDUELLE' },
        'Qualification': 'DELIT',
        'Pays': { '#text': fake.country() },
        'Recidive': fake.boolean(),
        'Complicite': fake.boolean(),
        'Libelle': natinfs[natinf],
        'Libelle_Magistrat': {
            'Lieux': [],
            'Dates': [],
            'Explication': '',
            'Articles_Prevus': [],
            'Articles_Reprimes': [],
            'Circonstances': '',
            'Victimes': ''
        },
        'Code_Postal_Commune': fake.postcode(),
        'Periode_Affaire_Fin': gen_date(),
        'Periode_Affaire_Debut': gen_date(),
        'Commune': fake.city(),
        'Tentative': fake.boolean(),
        'Nom_Departement': 'n/a',
        'Natinf': natinf,
        'Localisation': fake.address(),
        'Global_Id': str(uuid4()),
        'Id_Fait': i,
        'GpsX': gps_x,
        'GpsY': gps_y
    }

def main():
    parser = argparse.ArgumentParser(description='Génère des TGCM')
    parser.add_argument('nombre_faits', metavar='N', type=int,
                        help='Nombre de faits à générer')
    parser.add_argument('nombre_personnes', metavar='M', type=int,
                        help='Nombre de personnes à générer')

    args = parser.parse_args()
    facts = []
    personnes = []
    for i in range(args.nombre_faits):
        facts.append(generate_fact(i))

    for i in range(args.nombre_personnes):
        personnes.append(generate_basic(i))

    random.shuffle(personnes)

    mecs = personnes[:]
    for i, fact in enumerate(facts):
        personnes.append(
            generate_basic(i)
            | generate_vic(
                [
                    fact
                ]
            )
        )

    for mec in mecs:
        random.shuffle(facts)
        mec.update(generate_mec(facts[:5]))

    # partition the set into {mec, vic} and extend
    print(json.dumps({
        'Analyse_TRISTAN': {
            'Faits': facts,
            'Personnes': { 'Physiques': personnes }
        }
    }))
if __name__ == '__main__':
    main()
