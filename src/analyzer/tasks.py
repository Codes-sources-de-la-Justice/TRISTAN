from celery import shared_task, group, chord
from api.models import AnalysisTicket, AnalysisResult
import analyzer.sps as sps
import analyzer.utils as utils
import analyzer.timeline as timeline
import analyzer.audition as audition
import io

def initiate_worktree(ticket):
    """
    Prépare un environnement de travail pour les analyseurs.
    """
    pass

def fetch_and_parse_toc(case_id):
    """
    Récupère la table des contenus de SPS.
    Elle est enrichie de métadonnées en essayeant de lire les chemins d'accès
    pour faciliter l'usage aux analyseurs.
    """
    toc = sps.fetch_toc(case_id)
    # parse the TOC and enrich it.
    return toc

def fetch_piece(ticket, item):
    """
    Récupère une pièce d'une affaire pour l'analyse.
    Extrait l'XML en JSON, le texte et les images.

    Ces éléments sont mis en cache dans l'environnement de travail courant.
    e.g. RAM, système de fichier.
    """
    # TODO: ticket should contain a JWT for delegated auth.
    path = item['path']
    resp = sps.fetch_piece(path)
    raw = io.BytesIO(resp.content)
    xml_data = utils.extract_xml_into_json(raw)
    raw.seek(0)
    text_data = utils.extract_text(raw)
    # TODO: images

    return {"data": xml_data, "text": text_data, "images": [], 'source': path}

def mk_fact_for_map(fact, already_seen, payload, extra):
    # Non-exploitable data.
    if any(critical_key not in fact for critical_key in ('Fait_GpsX', 'Fait_GpsY', 'Natinf')):
        return

    key = f"{fact['Fait_GpsX']}|{fact['Fait_GpsY']}|{fact['Natinf']}"
    if key in already_seen:
        return

    payload['facts'].append({'x': fact['Fait_GpsX'], 'y': fact['Fait_GpsY'], 'label': fact.get('Libelle_Fait', 'pas de libellé'), 'natinf': fact['Natinf'], 'started_at_utc': fact['Periode_Affaire_Debut']['@utc']} | extra)
    already_seen.add(key)


def mk_facts_map(pieces):
    payload = {'type': 'map', 'facts': []}
    already_seen = set()

    for piece in pieces:
        if not piece['data']: # Useless data.
            continue

        facts = piece['data'].get('Procedure', {}).get('Faits', {}).get('Fait', {})
        extra = { 'source': piece['source'] }
        if isinstance(facts, list):
            for fact in facts:
                mk_fact_for_map(fact, already_seen, payload, extra)
        else:
            mk_fact_for_map(facts, already_seen, payload, extra)
        
    return payload

def mk_qa_results(pieces):
    payload = {'type': 'qa', 'auditions': []}

    for piece in pieces:
        if not piece['text']: # Useless data
            continue
        
        # TODO: use PDF A3 to finish the analysis
        qs = audition.extract_qa_session(piece['text'])
        if qs:
            payload['auditions'].append(qs)

    return payload

@shared_task
def extract_audition_qa(ticket_id, toc):
    ticket = AnalysisTicket.objects.get(id=ticket_id)
    AnalysisResult.objects.create(parent_ticket=ticket,
                                  payload=mk_qa_results(
                                      fetch_piece(ticket, item) for item in toc if item['path'].endswith('pdf')
                                  ))

@shared_task
def extract_facts_map(ticket_id, toc):
    ticket = AnalysisTicket.objects.get(id=ticket_id)
    # parallel fetching?
    AnalysisResult.objects.create(parent_ticket=ticket,
                                  payload=mk_facts_map(
                                      fetch_piece(ticket, item) for item in toc if item['path'].endswith('pdf'))
                                  )

@shared_task
def extract_facts_timeline(ticket_id, toc):
    ticket = AnalysisTicket.objects.get(id=ticket_id)
    ctx = timeline.GraphContext()
    # construire une ligne de temps des faits:
    # 1. commencer une analyse globale:
    # TODO: comment faire de l'enrichissement de données de façon intelligente?
    for item in filter(lambda i: i['path'].endswith('pdf'), toc):
        piece = fetch_piece(ticket, item)
        ctx.ingest(piece) # l'ingestion exécute 1 et 2 de façon incrémentale.
    # 3. créer le graphe et pousser le résultat d'analyse.
    AnalysisResult.objects.create(
        parent_ticket=ticket,
        payload={'type': 'timeline', 'graph': ctx.create_graph()}
    )

@shared_task
def end_analyze(result, ticket_id):
    AnalysisTicket.objects.filter(pk=ticket_id).update(status=AnalysisTicket.DONE)

@shared_task(autoretry_for=(Exception,), retry_backoff=True)
def cleanup_analyzes(request, exc, traceback, ticket_ids):
    print('cleanup of', ticket_ids)
    try:
        AnalysisTicket.objects.filter(id__in=ticket_ids).update(status=AnalysisTicket.ERROR)
        print('cleaned up')
    except Exception as e:
        print('fatal error during cleanup', e)
        raise e

@shared_task
def start_analyze(ticket_id):
    ticket = AnalysisTicket.objects.get(pk=ticket_id)
    try:
        # initiate a worktree
        initiate_worktree(ticket)
        toc = fetch_and_parse_toc(ticket.case_id)

        print(toc)
        # registered analyzers
        registered_analysers = list(map(lambda f: f.s(ticket_id, toc), [
            extract_facts_map,
            extract_facts_timeline,
            extract_audition_qa,
        ]))
        # TODO: parallelize analyzers and chain to end_analyze.

        (group(registered_analysers) | end_analyze.s(ticket_id)).on_error(cleanup_analyzes.s([ticket_id])).delay()
    except Exception as e:
        print('error', e)
        ticket.status = ticket.ERROR
        # TODO: catch db gone as a generic error.
        ticket.save()
