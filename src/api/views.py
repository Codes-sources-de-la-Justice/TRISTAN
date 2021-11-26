from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import Http404

from api.models import AnalysisTicket, AnalysisResult
from api.serializers import AnalysisResultSerializer, AnalysisTicketSerializer
from analyzer.tasks import start_analyze

@api_view(['GET', 'POST'])
def analyze(request):
    if request.method == 'POST':
        case_id = request.data.get('case_id')
        if not case_id:
            raise Http404

        ticket, created = AnalysisTicket.objects.get_or_create(case_id=case_id, status=AnalysisTicket.IN_PROGRESS) # valid by unique constraint.
        serializer = AnalysisTicketSerializer(ticket)
        if created:
            result = start_analyze.delay(ticket.id)
            ticket.task_id = result.id
            ticket.save()
            return Response({"message": f"Analyse démarrée", "ticket": serializer.data})
        else:
            return Response({"message": f"Analyse déjà en cours", "ticket": serializer.data})
    else:
        case_id = request.query_params.get('case_id')
        if not case_id:
            raise Http404
        ticket = AnalysisTicket.objects.filter(case_id=case_id).latest('updated_at')
        if not ticket:
            raise Http404
        serializer = AnalysisTicketSerializer(ticket)
        return Response(serializer.data)

@api_view(['GET'])
def analysis_results(request, case_id):
    try:
        ticket = AnalysisTicket.objects.filter(case_id=case_id, status=AnalysisTicket.DONE).latest('updated_at')
        # TODO: pagination
        serializer = AnalysisResultSerializer(ticket.results, many=True)
        return Response(serializer.data)
    except AnalysisTicket.DoesNotExist:
        raise Http404
