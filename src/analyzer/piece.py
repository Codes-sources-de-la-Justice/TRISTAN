import enum
from dataclasses import dataclass
from typing import Optional, List, Tuple, Callable
import re

class PieceNature(str, enum.Enum):
    PV_SYNTHESE = "PROCES-VERBAL_DE_SYNTHESE"
    PV_CLOTURE = "02_-_PV_ENQUETE_CLOTURE" # TODO: ???
    BORDEREAU_ENVOI_JUDICIAIRE = "BORDEREAU_D'ENVOI_JUDICIAIRE"
    BORDEREAU_ENVOI_JUDICIAIRE_INTERMEDIAIRE = "BORDEREAU_D'ENVOI_JUDICIAIRE_INTERMEDIAIRE"
    INVESTIGATIONS = "INVESTIGATIONS"
    INVESTIGATIONS_APRES_TRANSMISSION = "INVESTIGATIONS_APRES_TRANSMISSION"

    PRELEVEMENT_ADN = "__PRELEVEMENT_ADN"
    AUDITION = "__AUDITION"
    ATTESTATION_DEPOT_DE_PLAINTE = "__ATTESTATION_DEPOT_DE_PLAINTE"
    CONVOCATION_JUSTICE = "__CONVOCATION_JUSTICE"
    VOL_SUR_VEHICULE = "__VOL_SUR_VEHICULE"

    INCONNU = "__INCONNU"


@dataclass
class PieceMetadata:
    nature: PieceNature
    objet_interet: Optional[str] = None


def build_regex_analyzers(fs: List[Tuple[str, PieceNature]]) -> List[Callable[[str], Optional[PieceMetadata]]]:
    def regex_wrapper(regex, nature) -> Callable[[str], Optional[PieceMetadata]]:
        compiled = re.compile(regex)
        def inner(raw_text) -> Optional[PieceMetadata]:
            matches = compiled.fullmatch(raw_text)
            if not matches:
                return None

            objet_interet = matches.group('objet_interet')
            return PieceMetadata(nature=nature, objet_interet=objet_interet)
        
        inner.__name__ = f'regex_wrapper_pour_{nature}'
        inner.__doc__ = f"""Évalue si le texte passée en entrée vérifie la regex en vigueur et retourne une métadonnée de pièce de nature {nature} si oui, sinon None.
        """
        return inner

    return [regex_wrapper(regex, nature) for regex, nature in fs]

NATURE_ANALYZERS: List[Callable[[str], Optional[PieceMetadata]]] = build_regex_analyzers([
    (r'AUDITION_(?P<objet_interet>\w+)', PieceNature.AUDITION),
    (r'ATTESTATION_DEPOT_PLAINTE_(?P<objet_interet>\w+)', PieceNature.ATTESTATION_DEPOT_DE_PLAINTE),
    (r'ADN_PRELEVEMENT_DE_(?P<objet_interet>\w+)', PieceNature.PRELEVEMENT_ADN),
    (r'CONVOCATION_JUSTICE_(?P<objet_interet>\w+)', PieceNature.CONVOCATION_JUSTICE),
    (r'VOL_SUR_VEHICULE_(?P<objet_interet>\w+)', PieceNature.VOL_SUR_VEHICULE)
])


def nature_of(piece) -> PieceMetadata:
    data = piece.get('data')
    if data is None:
        return PieceMetadata(PieceNature.INCONNU)

    nme = data['Procedure']['Infos']['Nom_Enregistrement']

    try:
        nat = PieceNature(nme)
        return PieceMetadata(nature=nat)
    except ValueError:
        for analyzer in NATURE_ANALYZERS:
            if metadata := analyzer(nme):
                return metadata

    return PieceMetadata(PieceNature.INCONNU)

