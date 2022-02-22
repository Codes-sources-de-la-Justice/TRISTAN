import enum
import dataclasses
from analyzer.piece import PieceNature, nature_of
from analyzer.deep_dict import deep_get
from analyzer.timeline import find_authors, find_victims, find_indeterminate_persons, PersonRole, BagOfFacts, reconcile_persons

def is_bej(piece):
    return nature_of(piece).nature is PieceNature.BORDEREAU_ENVOI_JUDICIAIRE

def read_mapping_fact_ids(piece):
    facts = deep_get(piece, 'data.Procedure.Faits.Fait')

    def get_global_fact_id(fact):
        return int(fact.get('Fait_IdAleatoire_LRP', f'{fact.get("Natinf")}-{fact.get("Id_Fait")}'))

    if not facts:
        return []

    if isinstance(facts, list):
        return {int(fact['Id_Fait']): get_global_fact_id(fact) for fact in facts}
    else:
        return {int(facts['Id_Fait']): get_global_fact_id(facts)}

def implication_of_facts(key):
    def generic_getter(person):
        return list(
            map(int,
                map(str.strip,
                    filter(None, person.get(key, '').split('-'))
                )
            )
        )
    return generic_getter

author_of_facts = implication_of_facts('Personne_Physique_Auteur_Faits')
victim_of_facts = implication_of_facts('Personne_Physique_Victime_Faits')

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

        if not is_bej(piece):
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
        # Retourne la map IdFait -> IdAleatoireLRP
        fact_ids = read_mapping_fact_ids(piece)
        extra = { 'source': [source] }
        print('[summary] source', source)
        # Personne_Physique_Auteur_Faits
        self.extend_persons(PersonRole.VICTIM, find_victims(data), extra)
        self.extend_persons(PersonRole.AUTHOR, find_authors(data), extra)
        # self.extend_persons(PersonRole.WITNESS, find_witness(data), extra)

        for nature, persons in self.persons.items():
            for person in persons:
                local_fact_ids = []
                if nature is PersonRole.AUTHOR:
                    local_fact_ids = author_of_facts(person)
                elif nature is PersonRole.VICTIM:
                    local_fact_ids = victim_of_facts(person)

                # TODO: what do we do if a local_id is not there?
                if 'related_fact_ids' not in person:
                    person['related_fact_ids'] = []
                person['related_fact_ids'].extend([fact_ids[local_id] for local_id in local_fact_ids if local_id in fact_ids])
                person['related_fact_ids'] = list(set(person['related_fact_ids']))

        # 2. effectuer une liste des faits.
        self.consolidate_facts(piece)

        return True # À ce stade, on a ingéré quelque chose.

    def create_graph(self):
        # (métadonnées de noeuds, liste d'adj)
        metadata = {}
        node_index = 0

        # noeuds de personnes
        indictees = []
        victims = []
        for nature, persons in self.persons.items():
            for person in persons:
                if nature is PersonRole.AUTHOR:
                    indictees.append(person)
                elif nature is PersonRole.VICTIM:
                    victims.append(person)
                else:
                    continue

                person['id'] = node_index
                person['role'] = nature.value
                metadata[node_index] = person
                node_index += 1

        print('facts', self.facts)
        print(f'{len(metadata)} noeuds crées dont {node_index} individus.')

        return {'entities': {
            'indictees': indictees,
            'victims': victims
        }, 'facts': self.facts.to_dict(), 'metadata': metadata}


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


        return self.facts.ingest(piece)


