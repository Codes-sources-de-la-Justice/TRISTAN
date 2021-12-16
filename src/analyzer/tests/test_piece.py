from analyzer.piece import nature_of, PieceNature

def mk_enregistrement(fname):
    return {'data': {'Procedure': {'Infos': {'Nom_Enregistrement': fname}}}}

static = [
    (mk_enregistrement('AUDITION_ABC_DEF'), PieceNature.AUDITION, 'ABC_DEF'),
    (mk_enregistrement('ATTESTATION_DEPOT_PLAINTE_ABC_DEF'), PieceNature.ATTESTATION_DEPOT_DE_PLAINTE, 'ABC_DEF')
]


def test_nature_of_pieces():
    for enr, nature, interest in static:
        metadata = nature_of(enr)
        assert metadata.nature == nature
        assert metadata.objet_interet == interest
