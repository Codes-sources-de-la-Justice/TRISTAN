import enum
import dataclasses
from analyzer.piece import PieceNature, nature_of

class PersonRole(enum.Enum):
    VICTIM = "VICTIME"
    AUTHOR = "MIS(E) EN CAUSE"
    WITNESS = "TÉMOIN"
    UNKNOWN = "Indéterminé"

def find_persons(data, role=None):
    persons = data.get('Procedure', {}).get('Personnes', {}).get('Personnes_Physiques', {}).get('Personne', [])
    if isinstance(persons, list) and role is not None:
        return filter(lambda p: p.get('Personne_Implication', PersonRole.UNKNOWN) == role.value, persons)
    elif isinstance(persons, dict) and role is not None:
        return [persons] if persons.get('Personne_Implication', PersonRole.UNKNOWN) == role.value else []
    else:
        return []

def find_victims(data):
    return find_persons(data, role=PersonRole.VICTIM)

def find_authors(data):
    return find_persons(data, role=PersonRole.AUTHOR)

def find_witness(data):
    return find_persons(data, role=PersonRole.WITNESS)

def find_indeterminate_persons(data):
    return find_persons(data, role=PersonRole.UNKNOWN)

def find_vehicules(data):
    return data.get('Procedures', {}).get('Moyens_Transport', {})

def relink_complaint(piece):
    # prend un dépôt de plainte
    # lit l'enregistrement et tente une réconciliation.
    pass


def reconcile_person_field(key, old_person, new_person, extra):
    # TODO: que réconcilier exactement et comment?
    if key == 'Personne_Implication' and old_person.get(key) == PersonRole.UNKNOWN:
        return new_person.get(key)

    if key in extra:
        return old_person.get(key, []) + new_person.get(key, extra[key] if extra.get(key) else [])

    return new_person.get(key) if key in new_person else old_person.get(key)

def compute_person_id(person):
    return f'{person["Personne_Nom"]}-{person["Personne_Prenom"]}-{person["Personne_Naissance_Date"]}'

def compute_fact_id(fact):
    if 'Natinf' not in fact:
        return None
    else:
        return f"{fact['Natinf']}/{fact['Fait_GpsX']}/{fact['Fait_GpsY']}"

def compute_fact_ids(piece):
    data = piece.get('data')
        
    if not data:
        return False

    facts = data.get('Procedure', {}).get('Faits', {}).get('Fait', {})

    if isinstance(facts, list):
        return list(filter(None, (compute_fact_id(fact) for fact in facts)))
    else:
        return list(filter(None, [compute_fact_id(facts)]))

def reconcile_persons(old, new, extra):
    d_old = {compute_person_id(p): p for p in old}
    d_new = {compute_person_id(p): p for p in new}

    to_merge = d_old.keys() & d_new.keys()
    additions = d_new.keys() - d_old.keys()

    final = d_old.copy()
    for key in additions:
        final[key] = d_new[key]
        for k, v in extra.items():
            if k in final[key] and extra.get(k) is not None:
                final[key][k].extend(extra[k])
            else:
                final[key][k] = extra[k] if extra.get(k) is not None else []

    for key_to_merge in to_merge:
        old_p, new_p = d_old[key_to_merge], d_new[key_to_merge]
        for field_key in (old_p.keys() | new_p.keys()):
            final[key_to_merge][field_key] = reconcile_person_field(field_key, old_p, new_p, extra)

    return list(final.values())
    

class BagOfFacts:
    def __init__(self):
        self.bag = {}

    def __str__(self):
        return str(self.bag)

    def to_dict(self):
        return self.bag

    def create_or_update(self, fact):
        """
        Met à jour un fait déjà existant, ou le crée.
        """

        # natinf/fait_gpsx/fait_gpsy
        clef = f"{fact['natinf']}/{fact['position'][0]}/{fact['position'][1]}"
        if clef in self.bag:
            current = self.bag[clef]
            for key in (fact.keys() | current.keys()):
                # TODO: relise la politique de mise à jour.
                self.bag[clef][key] = fact[key] if (current[key] is None or (current[key] is not None and fact[key] is not None)) else current[key]
                
        else:
            self.bag[clef] = fact

    def ingest_sousfait(self, sousfait, extra):
        if 'Natinf' in sousfait:
            kwargs = {
                'start_utc': sousfait['Periode_Affaire_Debut']['@utc'],
                'end_utc': sousfait.get('Periode_Affaire_Fin', {'@utc': None})['@utc'],
                'tentative': True if sousfait.get('Fait_Tentative', None) == 'OUI' else False,
                'natinf': sousfait['Natinf'],
                'qualification': sousfait.get('Fait_Qualification', 'INCONNUE'), # est ce nécessaire, compte tenu du NATINF?
                'libelle': sousfait.get('Libelle_Fait'),
                'position': (float(sousfait.get('Fait_GpsX')), float(sousfait.get('Fait_GpsY')))
            }
            kwargs.update(extra)
            self.create_or_update(kwargs)
            # TODO: injecter l'auteur, la victime et les témoins si possible avec persons.


    def ingest(self, piece, persons) -> bool:
        src = piece.get('source')
        data = piece.get('data')
        
        if not data:
            return False

        fait = data.get('Procedure', {}).get('Faits', {})
        sousfaits = fait.get('Fait', {})
        if isinstance(sousfaits, list):
            for sousfait in sousfaits:
                self.ingest_sousfait(sousfait, {
                    'metadata': dataclasses.asdict(nature_of(piece)),
                    'mode_operatoire': fait.get('Maniere_Operer'),
                    'source': src
                })
        else:
            self.ingest_sousfait(sousfaits, {
                'mode_operatoire': fait.get('Maniere_Operer')
            })
        
        return True
        

class GraphContext:
    def __init__(self):
        self.persons = {}
        self.facts = BagOfFacts()


    def ingest_all(self, pieces) -> int:
        n = 0

        for piece in pieces:
            if self.ingest(piece):
                n += 1

        return n

    def ingest(self, piece) -> bool:
        if piece.get('data', None) is None:
            return False

        data = piece['data']
        source = piece['source']

        # 1a. trouver toutes les victimes (Personne_Implication == VICTIME)
        # 1b. trouver tous les mis en cause (Personne_Implication == MIS(E) EN CAUSE)
        # 1c. trouver tous les témoins (Personne_Implication == TÉMOIN)
        # 1d. réconcilier les dépôts de plainte avec le nom de l'enregistrement.
        # 1e. réconciliation des auditions dans le cadre d'un lien à une (tentative) d'infraction.
        # 1g. trouver tous les véhicules (VL_Nmr_Immatriculation, VL_Situation_Certificat_Immatriculation, VL_Nature)
        # 1h. trouver toutes les personnes indéterminées (Personne_Implication == Indéterminé)
        # pour chaque personne, effectuer une extraction d'image opportuniste.
        # pour chaque personne indéterminée, déterminer s'il existe une source de vérité supérieure.
        fact_ids = compute_fact_ids(piece)
        extra = { 'source': [source], 'fact_ids': fact_ids }
        self.extend_persons(PersonRole.VICTIM, find_victims(data), extra)
        self.extend_persons(PersonRole.AUTHOR, find_authors(data), extra)
        self.extend_persons(PersonRole.WITNESS, find_witness(data), extra)

        # 2. effectuer une liste des faits.
        self.consolidate_facts(piece)

        return True # À ce stade, on a ingéré quelque chose.

    def create_graph(self):
        # (métadonnées de noeuds, liste d'adj)
        graph = {}
        metadata = {}
        node_index = 0

        # noeuds de personnes
        for nature, persons in self.persons.items():
            for person in persons:
                person['__node_index'] = node_index
                person['role'] = nature.value
                metadata[node_index] = person
                node_index += 1

        print('facts', self.facts)
        print(f'{len(metadata)} noeuds crées dont {node_index} individus.')

        # - disposer les noeuds de type délit.
        # - disposer les noeuds de type victime, mis en cause, témoins.
        # - lier.
        # - disposer les noeuds de type interpellation.
        # - disposer les noeuds de type audition.
        # - lier.
        return {'nodes': metadata, 'adjacency_list': graph, 'facts': self.facts.to_dict()}


    def extend_persons(self, nature, new, extra):
        self.persons[nature] = reconcile_persons(self.persons.get(nature, []), new, extra)

    def consolidate_facts(self, piece) -> bool:
        src = piece['source']
        data = piece['data']

        # - délit: date, auteur, victime, témoins.
        # - interpellation: date, interpellé.
        # - audition: date, auditionné.

        # réconciliation des plaintes TODO
        #if is_complaint(data):
        #    relink_complaint(ctx, data)



        return self.facts.ingest(piece, self.persons)


